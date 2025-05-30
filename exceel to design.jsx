function main() {
    // Create main dialog window
    var dialog = new Window("dialog", "Batch Export Settings");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    
    // Add file selection group
    var fileGroup = dialog.add("group");
    fileGroup.orientation = "column";
    fileGroup.alignChildren = "left";
    fileGroup.spacing = 5;

    var owner = fileGroup.add("statictext", undefined, "Made by PetraCode Solutions");
    owner.justify = "center";
    owner.alignment = "center";
    
    // CSV file selection
    var csvGroup = fileGroup.add("group");
    csvGroup.add("statictext", undefined, "CSV File:");
    var csvPath = csvGroup.add("edittext", undefined, "");
    csvPath.preferredSize.width = 300;
    var csvBrowse = csvGroup.add("button", undefined, "Browse");
    
    // Template file selection
    var templateGroup = fileGroup.add("group");
    templateGroup.add("statictext", undefined, "AI Template:");
    var templatePath = templateGroup.add("edittext", undefined, "");
    templatePath.preferredSize.width = 300;
    var templateBrowse = templateGroup.add("button", undefined, "Browse");
    
    // Export folder selection
    var exportGroup = fileGroup.add("group");
    exportGroup.add("statictext", undefined, "Export Folder:");
    var exportPath = exportGroup.add("edittext", undefined, "");
    exportPath.preferredSize.width = 300;
    var exportBrowse = exportGroup.add("button", undefined, "Browse");
    
    // Export format selection
    var formatGroup = dialog.add("group");
    formatGroup.orientation = "row";
    formatGroup.add("statictext", undefined, "Export Format:");
    var dropdown = formatGroup.add("dropdownlist", undefined, ["PNG", "JPEG"]);
    dropdown.selection = 0;

    // Add "Try Sample" checkbox
    var trySampleGroup = dialog.add("group");
    var trySampleCheckbox = trySampleGroup.add("checkbox", undefined, "Try Sample (first item only)");
    
    // Add spacer
    dialog.add("group").preferredSize.height = 10;
    
    // Buttons group
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    // Browse button handlers
    csvBrowse.onClick = function() {
        var file = File.openDialog("Select CSV file", "*.csv");
        if (file) csvPath.text = file.fsName;
    }
    
    templateBrowse.onClick = function() {
        var file = File.openDialog("Select Illustrator template", "*.ai");
        if (file) templatePath.text = file.fsName;
    }
    
    exportBrowse.onClick = function() {
        var folder = Folder.selectDialog("Select export folder");
        if (folder) exportPath.text = folder.fsName;
    }
    
    // Show dialog
    var response = dialog.show();
    
    if (response != 1) return; // Cancel clicked
    if (!csvPath.text || !templatePath.text || !exportPath.text) {
        alert("Please select all required files and folder.");
        main();
    }
    
    // Create File/Folder objects
    var csvFile = new File(csvPath.text);
    var templateFile = new File(templatePath.text);
    var exportFolder = new Folder(exportPath.text);
    var exportType = dropdown.selection.text.toUpperCase();
    
    // Verify files exist
    if (!csvFile.exists) {
        alert("CSV file does not exist!");
        return;
    }
    if (!templateFile.exists) {
        alert("Template file does not exist!");
        return;
    }
    if (!exportFolder.exists) {
        if (!exportFolder.create()) {
            alert("Could not create export folder!");
            return;
        }
    }

    function parseCSVLine(line) {
        var fields = [];
        var currentField = '';
        var inQuotes = false;
        
        for (var i = 0; i < line.length; i++) {
            var currentChar = line[i];
            
            if (currentChar === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Handle escaped quotes
                    currentField += '"';
                    i++;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (currentChar === ',' && !inQuotes) {
                // End of field
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += currentChar;
            }
        }
        
        // Add the last field
        fields.push(currentField);
        return fields;
    }
    
    // Read CSV data
    csvFile.open("r","TEXT","UTF-8");
    var csvData = [];
    while (!csvFile.eof) {
        var line = csvFile.readln();
        csvData.push(parseCSVLine(line));
    }
    csvFile.close();
    
    // Extract headers and rows
    var headers = csvData[0];
    var rows = csvData.slice(1);

    // Create progress window
    var progressWin = new Window("palette", "Export Progress");
    progressWin.orientation = "column";
    progressWin.alignChildren = "center";
    
    // Add status text
    var statusText = progressWin.add("statictext", undefined, "Preparing to export...");
    statusText.preferredSize.width = 300;
    
    // Add progress bar
    var progressBar = progressWin.add("progressbar", undefined, 0, rows.length);
    progressBar.preferredSize.width = 300;
    
    // Add current file indicator
    var fileText = progressWin.add("statictext", undefined, "");
    fileText.preferredSize.width = 300;

    progressWin.show();
    
    // Open the Illustrator template
    var doc = app.open(templateFile);

    // Function to replace image in placed item
    function replaceImage(placedItem, newImagePath) {
        try {
            // If the new image path is empty, hide the placed item
            if (newImagePath === '') {
                placedItem.hidden = true;
                return false;
            }
    
            newImagePath = newImagePath.replace(/[']/g, '');
            var newFile = new File(newImagePath);
            
            if (newFile.exists) {
                // Store original dimensions and position before replacement
                var originalWidth = placedItem.width;
                var originalHeight = placedItem.height;
                var originalPosition = placedItem.position;
    
                // Show placed item and replace the image
                placedItem.hidden = false;
                placedItem.file = newFile;
    
                // Apply the original dimensions and position to the new image
                placedItem.width = originalWidth;
                placedItem.height = originalHeight;
                placedItem.position = originalPosition;
    
                return true;
            } else {
                // Hide placed item if file doesn't exist
                placedItem.hidden = true;
                return false;
            }
        } catch (e) {
            $.writeln('Error: ' + e);
            // Hide placed item on error
            placedItem.hidden = true;
            return false;
        }
    }

    // Function to check if a layer exists and its type
    function getLayerType(doc, layerName) {
        try {
            doc.textFrames.getByName(layerName);
            return "text";
        } catch (e1) {
            try {
                doc.placedItems.getByName(layerName);
                return "image";
            } catch (e2) {
                return null;
            }
        }
    }

    var processRows = trySampleCheckbox.value ? [rows[0]] : rows;

    // Process each row
    for (var i = 0; i < processRows.length; i++) {

        var row = processRows[i];
        var data = {};
        
        // Update progress
        progressBar.value = i + 1;
        statusText.text = "Processing file " + (i + 1) + " of " + processRows.length;
        fileText.text = "Current file: " + (data["FileName"] || "Export_" + (i + 1));
        progressWin.update();
        
        // Process each column in the row
        for (var j = 0; j < headers.length; j++) {
            var layerType = getLayerType(doc, headers[j]);
            
            if (layerType) {
                data[headers[j]] = (layerType === "image") ? row[j].replace(/['"]/g, '') : row[j];
            }
        }

        function handleTextFrame(textFrame, content) {
            // Store original position and dimensions
            var originalBounds = textFrame.geometricBounds;
            var originalPosition = [textFrame.position[0], textFrame.position[1]];
            
            // Update content
            // textFrame.contents = content.replace(/\\n/g, '\n');
            textFrame.contents = content.replace(/`/g, '\n');

            if (textFrame.name === "phone"){
                if (content[0] === "7" || content[0] === "5") {
                    textFrame.contents = "0" + content;
                }
            }

            // if (textFrame.name === "price") {
            //     var red = new RGBColor();
            //     red.red = 255;
            //     red.green = 0;
            //     red.blue = 0;
            //     textFrame.textRange.characterAttributes.fillColor = red;
            // }

            
            // Maintain original position
            textFrame.position = originalPosition;
            
            // Check if text is overset
            if (textFrame.lines.length > 0) {
                // Adjust height while maintaining width and position
                var newBounds = [
                    originalBounds[0],  // Left
                    originalBounds[1],  // Top
                    originalBounds[2],  // Right
                    originalBounds[1] + textFrame.lines.length * textFrame.lines[0].height // Bottom
                ];
                textFrame.geometricBounds = newBounds;
            }
            
            // Optional: fit frame to content vertically
            textFrame.textRange.characterAttributes.autoLeading = false;
            textFrame.textRange.characterAttributes.leading = textFrame.textRange.characterAttributes.size * 1.2;
        }

        // Update text layers and images
        for (var key in data) {
            try {
                var textFrame = doc.textFrames.getByName(key);
                if (textFrame) {
                    //textFrame.contents = data[key];
                    handleTextFrame(textFrame, data[key]);
                    continue;
                }
            } catch (e) {
                try {
                    var placedItem = doc.placedItems.getByName(key);
                    if (placedItem && data[key]) {
                        replaceImage(placedItem, data[key]);
                    }
                    else{
                        replaceImage(placedItem, '');
                    }
                } catch (e2) {
                    // Skip if neither exists
                }
            }
        }

        // Generate the file name
        var fileName = (data["FileName"] || "Export_" + (i + 1)).replace(/[^a-zA-Z0-9]/g, "_");
        var file = new File(exportFolder.fsName + "/" + fileName);

        // Export based on selected type
        if (exportType === "PNG") {
            var options = new ExportOptionsPNG24();
            options.artBoardClipping = true;
            doc.exportFile(file, ExportType.PNG24, options);
        }
        else if (exportType === "JPEG") {
            var options = new ExportOptionsJPEG();
            options.qualitySetting = 80;
            doc.exportFile(file, ExportType.JPEG, options);
        }
        // Force UI update
        progressWin.update();
    }

    // Close progress window
    progressWin.close();

    // Close the document
    doc.close(SaveOptions.DONOTSAVECHANGES);

    alert("Export completed successfully!");
}


var systemUsername = $.getenv("USERPROFILE").split("\\")[2];
var secretFilePath = "C:/Program Files/Adobe/Adobe Illustrator CC 2019/Presets/en_US/Tools/illustrator-config.secret";
var secretFile = new File(secretFilePath);
// var envPath = $.getenv("script");
if (systemUsername === "ahmad" && secretFile.exists) {
    main();
} 
else {
    alert("This program does not support your adobe illustrator version.");
}