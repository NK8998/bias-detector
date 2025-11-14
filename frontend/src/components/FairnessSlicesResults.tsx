import type { FairnessSlice } from "../types/types";

interface FairnessSlicesProps {
  fairnessSlices: Record<string, FairnessSlice> | undefined;
}

export default function FairnessSlicesResults({
  fairnessSlices,
}: FairnessSlicesProps) {
  if (!fairnessSlices) {
    return (
      <div className='p-4 text-sm text-gray-700 border rounded bg-gray-50'>
        No fairness slices data available.
      </div>
    );
  }

  const metricLabels: Record<string, string> = {
    average_odds_difference: "Average Odds Difference",
    demographic_parity_difference: "Demographic Parity Difference",
    equal_opportunity_difference: "Equal Opportunity Difference",
    selection_rate_gap: "Selection Rate Gap",
    statistical_parity_ratio: "Statistical Parity Ratio",
  };

  return (
    <div className='space-y-10'>
      {Object.entries(fairnessSlices).map(([sliceName, sliceData]) => {
        const metrics = Object.entries(sliceData).filter(
          ([key]) => key !== "by_group"
        );

        return (
          <div key={sliceName} className='border rounded-lg bg-white'>
            {/* Slice Title */}
            <div className='p-5 border-b bg-gray-50'>
              <h3 className='text-lg font-bold tracking-tight text-black'>
                {sliceName.replace(/_/g, " ").toUpperCase()}
              </h3>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-white text-left text-gray-600'>
                    <th className='py-3 px-4 font-medium'>Metric</th>
                    <th className='py-3 px-4 font-medium'>Value</th>
                    <th className='py-3 px-4 font-medium'>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.map(([metric, value], index) => {
                    const numeric =
                      typeof value === "number" && !isNaN(value) ? value : null;

                    const isPositive =
                      numeric !== null ? numeric >= 0 : undefined;

                    return (
                      <tr
                        key={metric}
                        className={`border-b last:border-b-0 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className='py-3 px-4 text-gray-800'>
                          {metricLabels[metric] || metric}
                        </td>

                        <td className='py-3 px-4 font-semibold text-gray-900'>
                          {numeric !== null ? numeric.toFixed(4) : "N/A"}
                        </td>

                        <td className='py-3 px-4'>
                          {numeric !== null && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                isPositive
                                  ? "border-green-600 text-green-700"
                                  : "border-red-600 text-red-700"
                              }`}
                            >
                              {isPositive ? "Positive" : "Negative"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
