require 'json'

file_path = '/Users/kietla92/travel-app/front-end/public/data/countries.geojson'

geojson = JSON.parse(File.read(file_path))

geojson['features'].each do |feature|
  country_name = feature['properties']['name'] || feature['properties']['admin'] || 'Unknown'
  Country.create!(name: country_name, visited: false)
end

puts "Countries seeded successfully!"
