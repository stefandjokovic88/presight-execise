import { Router } from "express";
import { getDb } from "../db/connection.js";
import { parseListQuery, parseUserFilters } from "../parseQuery.js";
import {
  getTopHobbies,
  getTopNationalities,
  listUsers,
} from "../services/users.js";

export const apiRouter = Router();

apiRouter.get("/users", (req, res) => {
  try {
    const query = parseListQuery(req);
    const result = listUsers(getDb(), query);
    res.json(result);
  } catch (error) {
    console.error("GET /api/users failed:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

apiRouter.get("/facets/hobbies", (req, res) => {
  try {
    const filters = parseUserFilters(req);
    const items = getTopHobbies(getDb(), filters);
    res.json({ items });
  } catch (error) {
    console.error("GET /api/facets/hobbies failed:", error);
    res.status(500).json({ error: "Failed to fetch hobby facets" });
  }
});

apiRouter.get("/facets/nationalities", (req, res) => {
  try {
    const filters = parseUserFilters(req);
    const items = getTopNationalities(getDb(), filters);
    res.json({ items });
  } catch (error) {
    console.error("GET /api/facets/nationalities failed:", error);
    res.status(500).json({ error: "Failed to fetch nationality facets" });
  }
});
