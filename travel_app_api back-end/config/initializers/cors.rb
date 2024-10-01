Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://travel-app-1-m9f2.onrender.com', 'http://localhost:3001'  # Your React app's origin
    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head],
             credentials: true
  end
end
