import { createClient } from "@supabase/supabase-js";

// 替换为您的 Supabase 项目 URL 和匿名密钥
const SUPABASE_URL = "https://gfiaqcurffdlwaoacbax.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWFxY3VyZmZkbHdhb2FjYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODUyNTMsImV4cCI6MjA0OTc2MTI1M30.1iov3e1de6nwNPMNMnLMPsnKRZrAcNFGZZLl0TigB18";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const productTableBody = document.getElementById("productTableBody");

  data.forEach((product, index) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.description}</td>
    `;
    productTableBody.appendChild(newRow);
  });
}

document.addEventListener("DOMContentLoaded", fetchProducts);
