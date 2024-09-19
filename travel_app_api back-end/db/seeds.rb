japan = Country.find_by(name: 'Japan')
japan.cities.create([
  { name: 'Tokyo', places_stayed: 'Shibuya Hotel', recommendations: 'Visit Shibuya Crossing', highlights: 'Great food and shopping', dislikes: 'Crowded' },
  { name: 'Osaka', places_stayed: 'Namba Inn', recommendations: 'Osaka Castle', highlights: 'Osaka street food', dislikes: 'Expensive' },
  { name: 'Kyoto', places_stayed: 'Kyoto Ryokan', recommendations: 'Visit Fushimi Inari', highlights: 'Historic temples', dislikes: 'Touristy' }
])

south_korea = Country.find_by(name: 'South Korea')
south_korea.cities.create([
  { name: 'Seoul', places_stayed: 'Gangnam Hotel', recommendations: 'Visit Gyeongbokgung Palace', highlights: 'Korean BBQ', dislikes: 'Traffic' }
])

italy = Country.find_by(name: 'Italy')
italy.cities.create([
  { name: 'Rome', places_stayed: 'Hotel Forum', recommendations: 'Visit Colosseum', highlights: 'Rich history', dislikes: 'Pickpockets' }
])
