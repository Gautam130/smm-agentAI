export interface Festival {
  month: number;
  day: number;
  name: string;
}

export const INDIAN_FESTIVALS_2026: Festival[] = [
  { month: 0, day: 14, name: 'Makar Sankranti' },
  { month: 0, day: 26, name: 'Republic Day' },
  { month: 1, day: 16, name: 'Vasant Panchami' },
  { month: 1, day: 26, name: 'Maha Shivaratri' },
  { month: 2, day: 14, name: 'Holi' },
  { month: 3, day: 6, name: 'Ram Navami' },
  { month: 3, day: 14, name: 'Ambedkar Jayanti' },
  { month: 4, day: 1, name: 'Maharashtra Day' },
  { month: 4, day: 7, name: 'Buddha Purnima' },
  { month: 5, day: 17, name: 'Eid al-Adha' },
  { month: 6, day: 17, name: 'Muharram' },
  { month: 7, day: 15, name: 'Independence Day' },
  { month: 7, day: 24, name: 'Raksha Bandhan' },
  { month: 7, day: 31, name: 'Janmashtami' },
  { month: 8, day: 9, name: 'Ganesh Chaturthi' },
  { month: 8, day: 20, name: 'Onam' },
  { month: 9, day: 2, name: 'Gandhi Jayanti' },
  { month: 9, day: 12, name: 'Dussehra' },
  { month: 10, day: 1, name: 'Diwali' },
  { month: 10, day: 5, name: 'Bhai Dooj' },
  { month: 10, day: 10, name: 'Chhath Puja' },
  { month: 11, day: 25, name: 'Christmas' },
];

export function getUpcomingFestivals(daysAhead = 30): Festival[] {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + daysAhead);
  
  return INDIAN_FESTIVALS_2026.filter(fest => {
    const festDate = new Date(today.getFullYear(), fest.month, fest.day);
    return festDate >= today && festDate <= end;
  });
}

export function getFestivalsForMonth(month: number): Festival[] {
  return INDIAN_FESTIVALS_2026.filter(f => f.month === month);
}

export function getNearestFestival(date: Date): Festival | null {
  let nearest: Festival | null = null;
  let minDiff = Infinity;
  
  INDIAN_FESTIVALS_2026.forEach(fest => {
    const festDate = new Date(date.getFullYear(), fest.month, fest.day);
    const diff = Math.abs(date.getTime() - festDate.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      nearest = fest;
    }
  });
  
  return nearest;
}

export function getPostingDays(month: number, year: number, frequency: string): number[] {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const freqMap: Record<string, number[]> = {
    '2 per week': [2, 5],
    '3 per week': [1, 3, 5],
    '5 per week': [1, 2, 3, 4, 5],
    'Daily (7/week)': [0, 1, 2, 3, 4, 5, 6]
  };
  
  const postDayPattern = freqMap[frequency] || freqMap['3 per week'];
  const postingDays: number[] = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (postDayPattern.includes(dow)) {
      postingDays.push(d);
    }
  }
  
  return postingDays;
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];