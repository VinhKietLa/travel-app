class CitySerializer < ActiveModel::Serializer
  attributes :id, :name, :latitude, :longitude, :images_urls

  def images_urls
    object.images.map do |image|
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    end
  end
end
