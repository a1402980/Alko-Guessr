"use client";

import SpinningWheel, { Segments } from "./spinning-wheel";

const SpinnerPage = () => {
  const segments: Segments[] = [
    {
      segmentText: "foo",
      segColor: "red",
    },
    {
      segmentText: "bar",
      segColor: "blue",
    },
    { segmentText: "baz", segColor: "yellow" },
  ];
  return (
    <SpinningWheel
      buttonText="Test"
      segments={segments}
      onFinished={(result) => console.log(result)}
    />
  );
};

export default SpinnerPage;
