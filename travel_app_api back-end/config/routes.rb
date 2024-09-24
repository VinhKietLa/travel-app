Rails.application.routes.draw do
  resources :countries, only: [:index, :show, :create, :update, :destroy] do
    resources :cities, only: [:index, :show, :create, :update, :destroy]
  end

  get '/countries/find_by_name/:name', to: 'countries#find_by_name'

end
