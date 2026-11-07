import { SpringSmoothScheduler } from '@fluxdown/core-plugins/plugins/mapper/smooth';

export const ARRIVALS = [
  { time: 600, total: 25 },
  { time: 2300, total: 70 },
  { time: 3500, total: 120 },
  { time: 4300, total: 170 },
  { time: 5000, total: 220 },
];

export const DURATION = 6000;

export const TOTAL = 220;

export const createSpringTrace = () => {
  const scheduler = new SpringSmoothScheduler();
  scheduler.start(0);
  let received = 0;
  let visible = 0;
  let nextArrival = 0;
  const samples = [{ time: 0, received, visible }];

  for (let time = 20; time <= DURATION; time += 20) {
    const arrival = ARRIVALS[nextArrival];
    if (arrival && time >= arrival.time) {
      scheduler.push(arrival.total - received, arrival.time);
      received = arrival.total;
      nextArrival += 1;
    }
    visible += scheduler.tick(time);
    samples.push({ time, received, visible });
  }
  return samples;
};

export const TRACE = createSpringTrace();
