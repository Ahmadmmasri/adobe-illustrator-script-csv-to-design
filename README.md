<h1>Adobe Illustrator CSV Export Script</h1>

<p>This project is an Adobe Illustrator script designed to automate the export of images based on layer data matched from a CSV file. It enables designers and developers to efficiently generate batch exports in various formats (PNG, JPG, PDF), using layer names from an <code>.ai</code> file as reference.</p>

<h2>✨ Features</h2>
<ul>
  <li>🖼️ Supports exporting to <strong>PNG</strong>, <strong>JPG</strong>, and <strong>PDF</strong> formats</li>
  <li>📄 Reads a <strong>CSV file</strong> where <strong>headers</strong> match Illustrator <strong>layer names</strong></li>
  <li>🧠 Automatically matches CSV headers to layers in the <code>.ai</code> file</li>
  <li>📁 Exports images to a specified output path</li>
  <li>🔄 Ideal for batch-generating product shots, personalized artwork, or bulk templating</li>
</ul>

<h2>📁 File Structure</h2>
<pre><code>├── exceel to design.jsx      # Adobe Illustrator script
├── sample.ai               # Illustrator file (template)
├── data.csv                # CSV file with headers matching AI layer names
├── image_sample.jpg        # for images in design sample matching AI layer names
└── README.html             # Project documentation in HTML
</code></pre>

<h2>🛠️ Requirements</h2>
<ul>
  <li>Adobe Illustrator (Tested with CC 2020+)</li>
  <li>CSV file with valid headers matching the target layers</li>
  <li><code>.ai</code> file with properly named and organized layers</li>
</ul>

<h2>📌 How It Works</h2>
<ol>
  <li>The script reads your provided CSV file.</li>
  <li>It matches <strong>each CSV header</strong> with the corresponding <strong>layer name</strong> in the Illustrator file.</li>
  <li>For each row in the CSV, it customizes the AI document based on the matching values.</li>
  <li>It exports the result as an image in the selected format (PNG, JPG, or PDF).</li>
  <li>All images are saved to a specified <strong>output path</strong>.</li>
</ol>

<h2>🧾 CSV Format</h2>
<p>Each header must match a layer name in the <code>.ai</code> file:</p>

<pre><code>Name,Title,Avatar
John Doe,Designer,avatar1.png
Jane Smith,Engineer,avatar2.png
</code></pre>

<ul>
  <li><code>Name</code>, <code>Title</code>, and <code>Avatar</code> are layer names in the <code>.ai</code> file.</li>
  <li>Values in each row are injected into the corresponding layers.</li>
  <li>You can include image paths (e.g., for avatars).</li>
</ul>

<h2>🖱️ Usage</h2>
<ol>
  <li>Open Adobe Illustrator.</li>
  <li>Load your <code>.ai</code> file.</li>
  <li>Run the <code>export-script.jsx</code> script.</li>
  <li>Choose:
    <ul>
      <li>Your <code>.csv</code> file</li>
      <li>Desired export format (<code>PNG</code>, <code>PDF</code>, or <code>JPG</code>)</li>
      <li>Output path for the images</li>
    </ul>
  </li>
  <li>The script will generate one export per CSV row.</li>
</ol>

<h2>🧪 Example Use Case</h2>
<p>Imagine you have an Illustrator template with placeholders for name, title, and image. You can generate hundreds of personalized ID cards or flyers by just supplying the CSV and running the script.</p>

<h2>🚧 Notes</h2>
<ul>
  <li>All matching is <strong>case-sensitive</strong>.</li>
  <li>Images referenced in the CSV must exist at the given paths.</li>
  <li>The output format selection is manual when running the script.</li>
</ul>
