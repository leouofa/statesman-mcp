import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { StatesmanApiClient, StatesmanApiError } from "../src/client/index.js";

describe("StatesmanApiClient", () => {
  let mock: MockAdapter;
  let client: StatesmanApiClient;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new StatesmanApiClient({
      apiUrl: "http://localhost:3000/api/v1",
      timeoutMs: 5000
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it("fetches platform status successfully", async () => {
    const mockStatus = {
      status: "ok",
      environment: "test",
      timestamp: "2026-11-13T00:00:00Z",
      counts: {
        continents: 7,
        countries: 195,
        countries_embedded: 195,
        cities: 1560,
        cities_embedded: 1560,
        cluster_snapshots: 4,
        cluster_reports: 2
      },
      config: {
        embedding_model: "qwen3-embedding:0.6b",
        embedding_api_base: "http://localhost:11434/v1",
        embedding_dimensions: 1024,
        llm_model: "Qwen3.6-35B-A3B-NVFP4",
        llm_api_base: "http://localhost:11434/v1",
        context_window: 262144,
        digest_char_budget: 576716
      }
    };

    mock.onGet("http://localhost:3000/api/v1/status").reply(200, { data: mockStatus });

    const status = await client.getStatus();
    expect(status.status).toBe("ok");
    expect(status.counts.countries).toBe(195);
    expect(status.counts.cities).toBe(1560);
  });

  it("handles 404 not found errors cleanly", async () => {
    mock.onGet("http://localhost:3000/api/v1/countries/999").reply(404, {
      error: { code: "not_found", message: "Couldn't find Country with 'id'=999" }
    });

    await expect(client.getCountry(999)).rejects.toThrowError(StatesmanApiError);
    try {
      await client.getCountry(999);
    } catch (err: any) {
      expect(err.code).toBe("not_found");
      expect(err.status).toBe(404);
      expect(err.message).toContain("Couldn't find Country");
    }
  });

  it("performs unified semantic search", async () => {
    const mockResults = [
      { type: "Country", score: 0.91, data: { id: 1, name: "Singapore" } }
    ];

    mock
      .onGet("http://localhost:3000/api/v1/search", {
        params: { q: "maritime gateway", mode: "semantic", limit: 5 }
      })
      .reply(200, { data: mockResults, meta: { mode: "semantic", count: 1 } });

    const res = await client.search({ q: "maritime gateway", mode: "semantic", limit: 5 });
    expect(res.data).toEqual(mockResults);
  });

  it("finds country and city counterparts via neighbors endpoints", async () => {
    const mockCountries = [{ id: 2, name: "United Kingdom", neighbor_distance: 0.08 }];
    mock
      .onGet("http://localhost:3000/api/v1/countries/1/neighbors", {
        params: { limit: 5 }
      })
      .reply(200, { data: mockCountries });

    const countryNeighbors = await client.getCountryNeighbors(1, { limit: 5 });
    expect(countryNeighbors).toHaveLength(1);
    expect(countryNeighbors[0].name).toBe("United Kingdom");

    const mockCities = [{ id: 10, name: "Rotterdam", neighbor_distance: 0.06 }];
    mock
      .onGet("http://localhost:3000/api/v1/cities/4/neighbors", {
        params: { limit: 5, continent_id: 1 }
      })
      .reply(200, { data: mockCities });

    const cityNeighbors = await client.getCityNeighbors(4, { limit: 5, continent_id: 1 });
    expect(cityNeighbors).toHaveLength(1);
    expect(cityNeighbors[0].name).toBe("Rotterdam");
  });

  it("batch upserts cities for a country", async () => {
    const mockCities = [
      { id: 1, country_id: 5, name: "Marseille", description: "Port gateway", themes: ["port"] }
    ];

    mock.onPost("http://localhost:3000/api/v1/cities/upsert_batch").reply(200, {
      data: mockCities,
      meta: { country_id: 5, count: 1 }
    });

    const res = await client.upsertCitiesBatch(5, [
      { name: "Marseille", description: "Port gateway", themes: ["port"] }
    ]);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].name).toBe("Marseille");
  });

  it("computes live clustering and manages snapshots & reports", async () => {
    const mockClusters = {
      target_type: "Country",
      level: 5,
      distance_threshold: 0.2,
      full_coverage: false,
      total_embedded_count: 195,
      unembedded_count: 0,
      clusters_count: 14,
      singletons_count: 20,
      largest_cluster_size: 18,
      generated_at: "2026-11-13T00:00:00Z",
      clusters: [],
      singletons: []
    };

    mock
      .onGet("http://localhost:3000/api/v1/clusters", {
        params: { target_type: "Country", level: 5 }
      })
      .reply(200, { data: mockClusters });

    const clusters = await client.computeClusters({ target_type: "Country", level: 5 });
    expect(clusters.clusters_count).toBe(14);
    expect(clusters.distance_threshold).toBe(0.2);

    mock.onDelete("http://localhost:3000/api/v1/cluster_reports/7").reply(200, {
      data: { id: 7, title: "Maritime Report", deleted: true }
    });

    const deletedReport = await client.deleteClusterReport(7);
    expect(deletedReport.deleted).toBe(true);
  });
});
