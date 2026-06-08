"use client";

import dynamic from "next/dynamic";

import type { ApexOptions } from "apexcharts";

// ApexCharts touches `window`, so load it only on the client.
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ChartType = "bar" | "line" | "area" | "donut" | "pie" | "radialBar";

export function Chart({
  type,
  series,
  options,
  height = 320,
}: {
  type: ChartType;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options: ApexOptions;
  height?: number | string;
}) {
  return <ReactApexChart type={type} series={series} options={options} height={height} />;
}
