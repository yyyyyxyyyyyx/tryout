// Initialize Supabase client (ensure you're using the correct method)
const { createClient } = supabase;
const supabaseUrl = "https://gfiaqcurffdlwaoacbax.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWFxY3VyZmZkbHdhb2FjYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODUyNTMsImV4cCI6MjA0OTc2MTI1M30.1iov3e1de6nwNPMNMnLMPsnKRZrAcNFGZZLl0TigB18"; // Replace with your Supabase Anon Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the table body element
const tableBody = document.getElementById("table-body");

// Fetch products from Supabase
async function fetchProducts() {
    const { data, error } = await supabase
        .from('products') // Connect to the 'products' table
        .select('*'); // Get all fields of data

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    // Dynamically populate the table with product data
    data.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Call fetchProducts on page load
window.onload = fetchProducts;

// Event listener for the submit product button
document.getElementById("submit-product").addEventListener("click", () => {
    alert("This is where you can add a product submission form.");
    // You can implement a form popup here to add a new product or navigate to another page
});
