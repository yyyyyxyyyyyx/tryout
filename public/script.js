import { supabase } from '../supabase/supabaseClient.js';

async function fetchProducts() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  const tableBody = document.getElementById('productTable').querySelector('tbody');
  tableBody.innerHTML = ''; // 清空表格内容

  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>${product.price}</td>
    `;
    tableBody.appendChild(row);
  });
}

fetchProducts();
