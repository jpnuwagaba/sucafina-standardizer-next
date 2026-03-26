import { parseWktGeometry, type ParsedWktGeometry } from "@/lib/geospatial/wkt";

export type Standard1Row = {
  sucafina_plot_id: string;
  supplier_plot_id: string;
  farmer_id: string;
  supplier_code: string;
  plot_region: string;
  plot_district: string;
  plot_area_ha: number | null;
  plot_longitude: number | null;
  plot_latitude: number | null;
  plot_gps_point: string;
  plot_gps_polygon: string;
  plot_wkt: string;
  is_geodata_validated: boolean | null;
  is_cafe_practices_certified: boolean | null;
  is_rfa_utz_certified: boolean | null;
  is_impact_certified: boolean | null;
  is_organic_certified: boolean | null;
  is_4c_certified: boolean | null;
  is_fairtrade_certified: boolean | null;
  other_certification_name: string;
  plot_supply_chain: string;
  plot_farmer_group: string;
};

const standard1SeedRows: Standard1Row[] = [
  {
    sucafina_plot_id: "SUC-0001",
    supplier_plot_id: "SUP-PLT-2101",
    farmer_id: "FARM-9101",
    supplier_code: "UG-MUK-01",
    plot_region: "Central",
    plot_district: "Mukono",
    plot_area_ha: 3.4,
    plot_longitude: 32.8042,
    plot_latitude: 0.3538,
    plot_gps_point: "POINT(32.8042 0.3538)",
    plot_gps_polygon:
      "POLYGON((32.8011 0.3522,32.8035 0.3518,32.8056 0.3527,32.8064 0.3544,32.8052 0.3562,32.8031 0.3567,32.8016 0.3554,32.8011 0.3522))",
    plot_wkt: "POINT(32.8042 0.3538)",
    is_geodata_validated: true,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: false,
    is_impact_certified: true,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "Rainforest Pilot",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Mukono Growers A",
  },
  {
    sucafina_plot_id: "SUC-0002",
    supplier_plot_id: "SUP-PLT-2102",
    farmer_id: "FARM-9102",
    supplier_code: "UG-MBR-03",
    plot_region: "Western",
    plot_district: "Mbarara",
    plot_area_ha: 5.1,
    plot_longitude: 30.6448,
    plot_latitude: -0.6078,
    plot_gps_point: "POINT(30.6448 -0.6078)",
    plot_gps_polygon:
      "POLYGON((30.6419 -0.6106,30.6446 -0.6112,30.6475 -0.6099,30.6489 -0.6072,30.6481 -0.6041,30.6453 -0.6029,30.6426 -0.6038,30.6413 -0.6068,30.6419 -0.6106))",
    plot_wkt: "POINT(30.6448 -0.6078)",
    is_geodata_validated: true,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: true,
    is_4c_certified: false,
    is_fairtrade_certified: true,
    other_certification_name: "",
    plot_supply_chain: "Cooperative",
    plot_farmer_group: "Ankole Coffee Union",
  },
  {
    sucafina_plot_id: "SUC-0003",
    supplier_plot_id: "SUP-PLT-2103",
    farmer_id: "FARM-9103",
    supplier_code: "UG-GUL-08",
    plot_region: "Northern",
    plot_district: "Gulu",
    plot_area_ha: 4.6,
    plot_longitude: 32.2984,
    plot_latitude: 2.7759,
    plot_gps_point: "POINT(32.2984 2.7759)",
    plot_gps_polygon:
      "POLYGON((32.2946 2.7732,32.2971 2.7718,32.3006 2.7722,32.3021 2.7748,32.3014 2.7781,32.2988 2.7796,32.2955 2.7789,32.2938 2.7761,32.2946 2.7732))",
    plot_wkt: "POINT(32.2984 2.7759)",
    is_geodata_validated: false,
    is_cafe_practices_certified: null,
    is_rfa_utz_certified: null,
    is_impact_certified: false,
    is_organic_certified: null,
    is_4c_certified: false,
    is_fairtrade_certified: null,
    other_certification_name: "Pending verification",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "Acholi Producers B",
  },
  {
    sucafina_plot_id: "SUC-0004",
    supplier_plot_id: "SUP-PLT-2104",
    farmer_id: "FARM-9104",
    supplier_code: "UG-IBA-02",
    plot_region: "Western",
    plot_district: "Ibanda",
    plot_area_ha: 1.1,
    plot_longitude: 30.4979,
    plot_latitude: -0.1413,
    plot_gps_point: "POINT(30.4979 -0.1413)",
    plot_gps_polygon: "",
    plot_wkt: "POINT(30.4979 -0.1413)",
    is_geodata_validated: true,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: false,
    is_impact_certified: true,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Ibanda Pioneer",
  },
  {
    sucafina_plot_id: "SUC-0005",
    supplier_plot_id: "SUP-PLT-2105",
    farmer_id: "FARM-9105",
    supplier_code: "UG-KYE-04",
    plot_region: "Western",
    plot_district: "Kyenjojo",
    plot_area_ha: 6.8,
    plot_longitude: 30.6444,
    plot_latitude: 0.6272,
    plot_gps_point: "POINT(30.6444 0.6272)",
    plot_gps_polygon:
      "POLYGON((30.6406 0.6231,30.6438 0.6216,30.6479 0.6224,30.6497 0.6256,30.6492 0.6298,30.6464 0.6321,30.6425 0.6317,30.6401 0.6284,30.6406 0.6231))",
    plot_wkt: "POINT(30.6444 0.6272)",
    is_geodata_validated: true,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: true,
    is_4c_certified: false,
    is_fairtrade_certified: true,
    other_certification_name: "Bird Friendly",
    plot_supply_chain: "Cooperative",
    plot_farmer_group: "Rwenzori Highlands",
  },
  {
    sucafina_plot_id: "SUC-0006",
    supplier_plot_id: "SUP-PLT-2106",
    farmer_id: "FARM-9106",
    supplier_code: "UG-MBA-07",
    plot_region: "Western",
    plot_district: "Mbale",
    plot_area_ha: 2.7,
    plot_longitude: 34.1788,
    plot_latitude: 1.0771,
    plot_gps_point: "POINT(34.1788 1.0771)",
    plot_gps_polygon:
      "POLYGON((34.1746 1.0742,34.1773 1.0728,34.1808 1.0735,34.1826 1.0759,34.1822 1.0791,34.1795 1.0813,34.1762 1.0808,34.1743 1.0781,34.1746 1.0742))",
    plot_wkt: "POINT(34.1788 1.0771)",
    is_geodata_validated: false,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: null,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Mt Elgon North",
  },
  {
    sucafina_plot_id: "SUC-0007",
    supplier_plot_id: "SUP-PLT-2107",
    farmer_id: "FARM-9107",
    supplier_code: "UG-KAB-02",
    plot_region: "Western",
    plot_district: "Kabale",
    plot_area_ha: 4.2,
    plot_longitude: 29.9956,
    plot_latitude: -1.2658,
    plot_gps_point: "POINT(29.9956 -1.2658)",
    plot_gps_polygon:
      "POLYGON((29.9911 -1.2698,29.9948 -1.2711,29.9986 -1.2696,30.0002 -1.2663,29.9994 -1.2624,29.9963 -1.2606,29.9927 -1.2615,29.9908 -1.2646,29.9911 -1.2698))",
    plot_wkt: "POINT(29.9956 -1.2658)",
    is_geodata_validated: true,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: true,
    is_impact_certified: true,
    is_organic_certified: false,
    is_4c_certified: false,
    is_fairtrade_certified: true,
    other_certification_name: "",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "Kigezi South",
  },
  {
    sucafina_plot_id: "SUC-0008",
    supplier_plot_id: "SUP-PLT-2108",
    farmer_id: "FARM-9108",
    supplier_code: "UG-HOI-03",
    plot_region: "Western",
    plot_district: "Hoima",
    plot_area_ha: 0.8,
    plot_longitude: 31.3445,
    plot_latitude: 1.4337,
    plot_gps_point: "POINT(31.3445 1.4337)",
    plot_gps_polygon: "",
    plot_wkt: "POINT(31.3445 1.4337)",
    is_geodata_validated: null,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: null,
    is_impact_certified: false,
    is_organic_certified: false,
    is_4c_certified: false,
    is_fairtrade_certified: null,
    other_certification_name: "Pilot Block",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "Albertine Trial",
  },
  {
    sucafina_plot_id: "SUC-0009",
    supplier_plot_id: "SUP-PLT-2109",
    farmer_id: "FARM-9109",
    supplier_code: "UG-BUS-04",
    plot_region: "Eastern",
    plot_district: "Bushenyi",
    plot_area_ha: 7.3,
    plot_longitude: 30.1839,
    plot_latitude: -0.5456,
    plot_gps_point: "POINT(30.1839 -0.5456)",
    plot_gps_polygon:
      "POLYGON((30.1787 -0.5502,30.1824 -0.5518,30.1869 -0.5504,30.1893 -0.5471,30.1887 -0.5429,30.1858 -0.5398,30.1816 -0.5394,30.1786 -0.5422,30.1787 -0.5502))",
    plot_wkt: "POINT(30.1839 -0.5456)",
    is_geodata_validated: true,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: true,
    is_impact_certified: true,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "",
    plot_supply_chain: "Cooperative",
    plot_farmer_group: "Ankole East",
  },
  {
    sucafina_plot_id: "SUC-0010",
    supplier_plot_id: "SUP-PLT-2110",
    farmer_id: "FARM-9110",
    supplier_code: "UG-MAS-02",
    plot_region: "Central",
    plot_district: "Masaka",
    plot_area_ha: 3.9,
    plot_longitude: 31.7425,
    plot_latitude: -0.3194,
    plot_gps_point: "POINT(31.7425 -0.3194)",
    plot_gps_polygon:
      "POLYGON((31.7386 -0.3233,31.7419 -0.3247,31.7458 -0.3236,31.7476 -0.3208,31.7468 -0.3173,31.7439 -0.3155,31.7404 -0.3162,31.7383 -0.3191,31.7386 -0.3233))",
    plot_wkt: "POINT(31.7425 -0.3194)",
    is_geodata_validated: false,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: false,
    is_impact_certified: true,
    is_organic_certified: true,
    is_4c_certified: false,
    is_fairtrade_certified: false,
    other_certification_name: "Regenerative Pilot",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Masaka Valley",
  },
  {
    sucafina_plot_id: "SUC-0011",
    supplier_plot_id: "SUP-PLT-2111",
    farmer_id: "FARM-9111",
    supplier_code: "UG-KYE-09",
    plot_region: "Western",
    plot_district: "Kasese",
    plot_area_ha: 0.6,
    plot_longitude: 30.1282,
    plot_latitude: 0.1881,
    plot_gps_point: "POINT(30.1282 0.1881)",
    plot_gps_polygon: "",
    plot_wkt: "POINT(30.1282 0.1881)",
    is_geodata_validated: true,
    is_cafe_practices_certified: null,
    is_rfa_utz_certified: null,
    is_impact_certified: false,
    is_organic_certified: null,
    is_4c_certified: false,
    is_fairtrade_certified: null,
    other_certification_name: "",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "Rwenzori Slopes",
  },
  {
    sucafina_plot_id: "SUC-0012",
    supplier_plot_id: "SUP-PLT-2112",
    farmer_id: "FARM-9112",
    supplier_code: "UG-SOR-01",
    plot_region: "Eastern",
    plot_district: "Soroti",
    plot_area_ha: 5.9,
    plot_longitude: 33.6311,
    plot_latitude: 1.7145,
    plot_gps_point: "POINT(33.6311 1.7145)",
    plot_gps_polygon:
      "POLYGON((33.6268 1.7109,33.6301 1.7098,33.6346 1.7107,33.6368 1.7136,33.6363 1.7179,33.6337 1.7204,33.6298 1.7201,33.6269 1.7174,33.6268 1.7109))",
    plot_wkt: "POINT(33.6311 1.7145)",
    is_geodata_validated: true,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: true,
    other_certification_name: "",
    plot_supply_chain: "Cooperative",
    plot_farmer_group: "Teso Growers",
  },
  {
    sucafina_plot_id: "SUC-0013",
    supplier_plot_id: "SUP-PLT-2113",
    farmer_id: "FARM-9113",
    supplier_code: "UG-LIR-06",
    plot_region: "Northern",
    plot_district: "Lira",
    plot_area_ha: 4.8,
    plot_longitude: 32.8924,
    plot_latitude: 2.2531,
    plot_gps_point: "POINT(32.8924 2.2531)",
    plot_gps_polygon:
      "POLYGON((32.8887 2.2497,32.8915 2.2481,32.8952 2.2485,32.8971 2.2513,32.8968 2.2551,32.8944 2.2576,32.8909 2.2574,32.8888 2.2546,32.8887 2.2497))",
    plot_wkt: "POINT(32.8924 2.2531)",
    is_geodata_validated: false,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: false,
    is_impact_certified: true,
    is_organic_certified: true,
    is_4c_certified: false,
    is_fairtrade_certified: false,
    other_certification_name: "Soil Carbon Program",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Lango Initiative",
  },
  {
    sucafina_plot_id: "SUC-0014",
    supplier_plot_id: "SUP-PLT-2114",
    farmer_id: "FARM-9114",
    supplier_code: "UG-JIN-02",
    plot_region: "Eastern",
    plot_district: "Jinja",
    plot_area_ha: 0.9,
    plot_longitude: 33.2155,
    plot_latitude: 0.4416,
    plot_gps_point: "POINT(33.2155 0.4416)",
    plot_gps_polygon: "",
    plot_wkt: "POINT(33.2155 0.4416)",
    is_geodata_validated: true,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Victoria Basin",
  },
  {
    sucafina_plot_id: "SUC-0015",
    supplier_plot_id: "SUP-PLT-2115",
    farmer_id: "FARM-9115",
    supplier_code: "UG-ARU-03",
    plot_region: "Northern",
    plot_district: "Arua",
    plot_area_ha: 1.3,
    plot_longitude: 30.9289,
    plot_latitude: 3.0235,
    plot_gps_point: "POINT(30.9289 3.0235)",
    plot_gps_polygon: "",
    plot_wkt: "POINT(30.9289 3.0235)",
    is_geodata_validated: null,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: null,
    is_impact_certified: false,
    is_organic_certified: false,
    is_4c_certified: false,
    is_fairtrade_certified: null,
    other_certification_name: "Onboarding",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "West Nile Cluster",
  },
];

function resolvePreferredPlotWkt(row: Standard1Row): string {
  const candidates = [row.plot_gps_polygon, row.plot_gps_point, row.plot_wkt]
    .map((value) => {
      const trimmed = value.trim();
      if (!trimmed) return null;

      const geometry = parseWktGeometry(trimmed);
      if (!geometry) return null;

      return { value: trimmed, geometry };
    })
    .filter(
      (candidate): candidate is { value: string; geometry: ParsedWktGeometry } => candidate !== null,
    );

  const preferred =
    candidates.find((candidate) => candidate.geometry.type === "MultiPolygon") ||
    candidates.find((candidate) => candidate.geometry.type === "Polygon") ||
    candidates.find((candidate) => candidate.geometry.type === "Point");

  return preferred?.value || row.plot_wkt;
}

export const standard1Rows: Standard1Row[] = standard1SeedRows.map((row) => ({
  ...row,
  plot_wkt: resolvePreferredPlotWkt(row),
}));

type Standard1FeatureProperties = {
  sucafina_plot_id: string;
  supplier_code: string;
  plot_region: string;
  plot_district: string;
  is_geodata_validated: boolean | null;
  plot_supply_chain: string;
};

type Standard1GeometryFeature = {
  type: "Feature";
  geometry: ParsedWktGeometry;
  properties: Standard1FeatureProperties;
};

export type Standard1FeatureCollection = {
  type: "FeatureCollection";
  features: Standard1GeometryFeature[];
};

export function buildStandard1FeatureCollection(rows: Standard1Row[]): Standard1FeatureCollection {
  const features = rows
    .map<Standard1GeometryFeature | null>((row) => {
      const geometry = parseWktGeometry(row.plot_wkt);
      if (!geometry) return null;

      return {
      type: "Feature",
      geometry,
      properties: {
        sucafina_plot_id: row.sucafina_plot_id,
        supplier_code: row.supplier_code,
        plot_region: row.plot_region,
        plot_district: row.plot_district,
        is_geodata_validated: row.is_geodata_validated,
        plot_supply_chain: row.plot_supply_chain,
      },
      };
    })
    .filter((feature): feature is Standard1GeometryFeature => feature !== null);

  return { type: "FeatureCollection", features };
}
