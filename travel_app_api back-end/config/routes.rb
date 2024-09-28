Rails.application.routes.draw do
  resources :countries, only: [:index, :show, :create, :update, :destroy] do
    resources :cities, only: [:index, :show, :create, :update, :destroy]
  end

  get '/countries/find_by_name/:name', to: 'countries#find_by_name'
  get 'travel_stats', to: 'travel_stats#index'

  resource :legend_position, only: [:show, :update]
  direct :rails_blob do |blob, options|
    route_for(:rails_blob, blob, options)
  end
end
