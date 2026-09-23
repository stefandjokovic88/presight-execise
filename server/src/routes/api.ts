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

apiRouter.get("/facets", (req, res) => {
  try {
    const filters = parseUserFilters(req);
    const db = getDb();
    res.json({
      hobbies: getTopHobbies(db, filters),
      nationalities: getTopNationalities(db, filters),
    });
  } catch (error) {
    console.error("GET /api/facets failed:", error);
    res.status(500).json({ error: "Failed to fetch facets" });
  }
});
