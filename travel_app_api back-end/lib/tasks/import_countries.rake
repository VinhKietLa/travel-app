namespace :import do
    desc "Import countries from GeoJSON"
    task countries: :environment do
      file_path = Rails.root.join('db', 'geojson', 'world.geojson')
      geojson_data = JSON.parse(File.read(file_path))
  
      geojson_data['features'].each do |feature|
        country_name = feature['properties']['name']
  
        # Find or create the country in the database
        Country.find_or_create_by(name: country_name) do |country|
          country.visited = false
          country.future_travel = false
        end
      end
  
      puts "Countries imported successfully!"
    end
  end
  