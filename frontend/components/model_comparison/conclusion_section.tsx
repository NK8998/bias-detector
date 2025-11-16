import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ConclusionSection() {
  return (
    <section className='mt-16 mb-20'>
      <Card className='bg-white border shadow-sm'>
        <CardHeader>
          <CardTitle className='text-3xl font-extrabold text-gray-800'>
            🧩 Final Thoughts & Key Takeaways
          </CardTitle>
          <CardDescription className='text-gray-700'>
            A clear breakdown of what this comparison reveals about dataset
            quality and model fairness.
          </CardDescription>
        </CardHeader>

        <CardContent className='text-gray-700 leading-relaxed space-y-4'>
          <p>
            This analysis highlights a central truth in machine learning:{" "}
            <strong>
              models don’t magically become fair — their training data decides
              the limits of their ethics.
            </strong>{" "}
            The fair model, trained on balanced data, maintains strong accuracy
            across multiple slices and shows much more predictable decision
            patterns. Meanwhile, the biased model exposes inconsistencies tied
            to features like age, gender, and job type, proving how harmful
            skewed data can be.
          </p>

          <p>
            The fairness slices further reinforce this story. Certain ranges
            experience dramatic swings in selection rates and accuracy, showing
            that even a high overall accuracy can hide serious structural bias.
            When the dataset is skewed, the model ends up amplifying those
            inequalities — not fixing them.
          </p>

          <p>
            In practice, this means two things:{" "}
            <strong>monitor your data</strong> and{" "}
            <strong>monitor your model</strong>. Bias rarely enters the system
            through a single door — it seeps in gradually through imbalanced
            inputs, unrepresentative samples, and historical patterns. Fairness
            evaluations like the one you’ve just seen make these issues visible,
            measurable, and fixable.
          </p>

          <p className='font-semibold text-gray-800'>
            In short: great models are built, not wished into existence. And if
            your dataset is biased, your model will be too — no matter how shiny
            the algorithm is.
          </p>

          <p>
            This demonstration shows that with the right tools and the right
            data, fairness isn’t a lucky accident. It’s a deliberate outcome.
            Keep your models honest, your data balanced, and your evaluations
            transparent.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
