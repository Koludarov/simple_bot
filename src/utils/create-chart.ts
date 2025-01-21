// eslint-disable-next-line @typescript-eslint/no-var-requires
const QuickChart = require('quickchart-js');

export function generateChartUrl(currentDay: number): string {
  const days = Array.from({ length: currentDay }, (_, i) => i + 1);
  const savings = days.map((num) => num * 650);

  const chart = new QuickChart();

  chart.setConfig({
    type: 'line',
    data: {
      labels: days.map((day) => `День ${day}`),
      datasets: [
        {
          label: 'Сэкономленные деньги (Динары)',
          data: savings,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    },
  });

  chart.setWidth(800).setHeight(600).setBackgroundColor('white');

  return chart.getUrl();
}

export function generateSmokingDesireChartUrl(desireData: { [day: string]: number }): string {
  const days = Object.keys(desireData);
  const desires = Object.values(desireData);

  const chart = new QuickChart();

  chart.setConfig({
    type: 'bar',
    data: {
      labels: days.map((day) => `День ${day}`),
      datasets: [
        {
          label: 'Количество желаний закурить',
          data: desires,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
  });

  chart.setWidth(800).setHeight(600).setBackgroundColor('white');

  return chart.getUrl();
}
