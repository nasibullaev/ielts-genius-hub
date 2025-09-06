import { Injectable } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export interface ChartData {
  type: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface GeneratedChart {
  imageUrl: string;
  chartData: ChartData;
  dataDescription: string;
}

@Injectable()
export class ChartGenerationService {
  private chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor() {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
      backgroundColour: 'white',
    });
  }

  private generateRandomData(
    count: number,
    min: number,
    max: number,
  ): number[] {
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * (max - min + 1)) + min,
    );
  }

  private generateRandomPercentages(count: number): number[] {
    const percentages = Array.from({ length: count }, () => Math.random());
    const sum = percentages.reduce((a, b) => a + b, 0);
    return percentages.map((p) => Math.round((p / sum) * 100));
  }

  private async saveChart(chartData: ChartData, type: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'writing-task1');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `chart-${type}-${timestamp}.png`;
    const filepath = path.join(uploadDir, filename);

    // Render chart
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer({
      type: chartData.type as any,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: `IELTS Writing Task 1 - ${type.replace('_', ' ').toUpperCase()}`,
            font: {
              size: 16,
              weight: 'bold' as const,
            },
          },
        },
        scales:
          chartData.type !== 'pie'
            ? {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0,0,0,0.1)',
                  },
                },
                x: {
                  grid: {
                    color: 'rgba(0,0,0,0.1)',
                  },
                },
              }
            : undefined,
      },
    });

    // Save file
    fs.writeFileSync(filepath, imageBuffer);

    return `/uploads/writing-task1/${filename}`;
  }

  async generateBarChart(userInterests?: string[]): Promise<GeneratedChart> {
    const years = ['2018', '2019', '2020', '2021', '2022', '2023'];
    const salesData = this.generateRandomData(years.length, 10, 50);

    // Use user interests to customize the chart
    const primaryInterest =
      userInterests && userInterests.length > 0
        ? userInterests[0]
        : 'Technology';

    const chartLabels = {
      technology: 'Technology Sales (millions)',
      education: 'Education Investment (millions)',
      health: 'Healthcare Spending (millions)',
      environment: 'Environmental Investment (millions)',
      sports: 'Sports Revenue (millions)',
      travel: 'Travel Industry Revenue (millions)',
      food: 'Food Industry Revenue (millions)',
      music: 'Music Industry Revenue (millions)',
    };

    const label =
      chartLabels[primaryInterest.toLowerCase()] || 'Sales (millions)';

    const chartData: ChartData = {
      type: 'bar',
      labels: years,
      datasets: [
        {
          label: label,
          data: salesData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    const imageUrl = await this.saveChart(chartData, 'bar');
    const dataDescription = `The bar chart shows ${primaryInterest.toLowerCase()} data from ${years[0]} to ${years[years.length - 1]}, with values ranging from ${Math.min(...salesData)} to ${Math.max(...salesData)} million dollars.`;

    return { imageUrl, chartData, dataDescription };
  }

  async generateLineChart(userInterests?: string[]): Promise<GeneratedChart> {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const temperatureData = this.generateRandomData(months.length, 15, 35);

    // Use user interests to customize the chart
    const primaryInterest =
      userInterests && userInterests.length > 0
        ? userInterests[0]
        : 'Technology';

    const chartLabels = {
      technology: 'Technology Usage (%)',
      education: 'Education Progress (%)',
      health: 'Health Index',
      environment: 'Environmental Score',
      sports: 'Sports Performance',
      travel: 'Travel Activity',
      food: 'Food Consumption',
      music: 'Music Streaming',
    };

    const label =
      chartLabels[primaryInterest.toLowerCase()] || 'Temperature (°C)';

    const chartData: ChartData = {
      type: 'line',
      labels: months,
      datasets: [
        {
          label: label,
          data: temperatureData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    };

    const imageUrl = await this.saveChart(chartData, 'line');
    const dataDescription = `The line graph displays ${primaryInterest.toLowerCase()} trends throughout the year, showing fluctuations from ${Math.min(...temperatureData)} to ${Math.max(...temperatureData)} units.`;

    return { imageUrl, chartData, dataDescription };
  }

  async generatePieChart(userInterests?: string[]): Promise<GeneratedChart> {
    // Use user interests to customize the chart categories
    const defaultCategories = [
      'Technology',
      'Healthcare',
      'Education',
      'Finance',
      'Retail',
    ];
    const categories =
      userInterests && userInterests.length > 0
        ? userInterests.slice(0, 5) // Take up to 5 interests
        : defaultCategories;

    const percentages = this.generateRandomPercentages(categories.length);

    const chartData: ChartData = {
      type: 'pie',
      labels: categories,
      datasets: [
        {
          label: 'Distribution (%)',
          data: percentages,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const imageUrl = await this.saveChart(chartData, 'pie');
    const dataDescription = `The pie chart illustrates distribution across different categories, with ${categories[0]} representing the largest portion at ${Math.max(...percentages)}%.`;

    return { imageUrl, chartData, dataDescription };
  }
}
