import React from "react";

export const FairnessMetricsExplanation = () => {
  return (
    <div className='space-y-8 p-8 bg-white border border-gray-300 rounded-lg'>
      <h2 className='text-2xl font-bold text-gray-900 border-b border-gray-300 pb-3'>
        Understanding the Fairness Metrics
      </h2>

      <p className='text-gray-700 text-sm leading-relaxed'>
        In addition to accuracy, evaluating a loan approval model requires
        checking whether decisions impact demographic groups differently. Below
        is a breakdown of the key fairness metrics used to assess how evenly the
        model treats different populations.
      </p>

      {/* Metric Block */}
      <div className='space-y-6'>
        {/* Average Odds Difference */}
        <div className='p-4 border border-gray-300 rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-900'>
            1. Average Odds Difference
          </h3>
          <p className='text-sm text-gray-700 mt-2'>
            Measures differences between groups in terms of false positives and
            false negatives.
            <br />
            <span className='font-semibold'>0 means perfectly fair;</span>
            larger positive or negative values indicate bias.
          </p>
        </div>

        {/* Demographic Parity Difference */}
        <div className='p-4 border border-gray-300 rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-900'>
            2. Demographic Parity Difference
          </h3>
          <p className='text-sm text-gray-700 mt-2'>
            Compares overall approval rates across groups, without considering
            ground truth.
            <br />
            <span className='font-semibold'>0 = equal approval rates.</span>
            Positive or negative differences may indicate imbalance in access to
            opportunities.
          </p>
        </div>

        {/* Equal Opportunity Difference */}
        <div className='p-4 border border-gray-300 rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-900'>
            3. Equal Opportunity Difference
          </h3>
          <p className='text-sm text-gray-700 mt-2'>
            Evaluates whether qualified applicants (those who should be
            approved) have equal approval rates across groups.
            <br />
            <span className='font-semibold'>0 indicates equal treatment.</span>
          </p>
        </div>

        {/* Selection Rate Gap */}
        <div className='p-4 border border-gray-300 rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-900'>
            4. Selection Rate Gap
          </h3>
          <p className='text-sm text-gray-700 mt-2'>
            Measures the difference in how often each group is selected or
            approved.
            <br />
            <span className='font-semibold'>
              0 = identical selection rates.
            </span>
          </p>
        </div>

        {/* Statistical Parity Ratio */}
        <div className='p-4 border border-gray-300 rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-900'>
            5. Statistical Parity Ratio
          </h3>
          <p className='text-sm text-gray-700 mt-2'>
            The ratio of approval rates between groups.
            <br />
            <span className='font-semibold'>1.0 is ideal.</span>
            Scores below <span className='font-semibold'>0.8</span> typically
            flag potential discrimination (“80% rule”).
          </p>
        </div>
      </div>

      <p className='text-gray-700 text-sm leading-relaxed pt-4 border-t border-gray-300'>
        In general, the closer these values are to their fairness targets (0 for
        differences, 1 for ratios), the more evenly the model treats all groups.
        Large deviations — whether positive or negative — may indicate bias that
        requires review.
      </p>
    </div>
  );
};
