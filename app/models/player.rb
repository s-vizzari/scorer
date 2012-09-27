class Player < ActiveRecord::Base
  attr_accessible :first_name, :handle, :last_name
  has_many :matches
  has_many :games, :through => :matches

  before_save :set_handle

  # If the handle is empty, then use the first letter of the first_name, followed by the last_name.
  def set_handle
    if self[:handle].nil?
      self.handle = self[:first_name].chr.downcase << self[:last_name].downcase
    end
  end

end