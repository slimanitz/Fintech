import React, { useEffect } from "react";
import Chart from "chart.js/auto";

 const DummyChart = () => {
  useEffect(() => {
    // Dummy data
    const labels = ["January", "February", "March", "April", "May"];
    const data = [10, 20, 15, 25, 18];

    // Create a chart context
    const ctx = document.getElementById("myChart").getContext("2d");

    // Create the chart
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Transaction Volume",
            data: data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }, []);

  return (
    <div>
      <canvas id="myChart"></canvas>
    </div>
  );
};

export default DummyChart;

