const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());


const CACHE = new Map();              
const CACHE_EXPIRY = 5 * 60 * 1000;   
const MAX_CACHE_SIZE = 100;           


function getCache(key) {
  if (CACHE.has(key)) {
    const entry = CACHE.get(key);
    const age = Date.now() - entry.timestamp;
    if (age < CACHE_EXPIRY) {
      return entry.data;          
    } else {
      CACHE.delete(key);          
    }
  }
  return null;
}


function setCache(key, data) {
  if (CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = CACHE.keys().next().value; 
    CACHE.delete(firstKey);
  }
  CACHE.set(key, { data, timestamp: Date.now() });
}


async function fetchFromAPI(url) {
  const cached = getCache(url);
  if (cached) return cached;

  const res = await axios.get(url);
  setCache(url, res.data);
  return res.data;
}



app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`;
  try {
    const data = await fetchFromAPI(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching search results" });
  }
});


app.get("/api/categories", async (req, res) => {
  const url = `https://www.themealdb.com/api/json/v1/1/list.php?c=list`;
  try {
    const data = await fetchFromAPI(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching categories" });
  }
});


app.get("/api/category/:name", async (req, res) => {
  const category = req.params.name;
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
  try {
    const data = await fetchFromAPI(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching meals by category" });
  }
});


app.get("/api/meal/:id", async (req, res) => {
  const id = req.params.id;
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  try {
    const data = await fetchFromAPI(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching meal details" });
  }
});


app.get("/api/random", async (req, res) => {
  const url = `https://www.themealdb.com/api/json/v1/1/random.php`;
  try {
    const data = await fetchFromAPI(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching random meal" });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
