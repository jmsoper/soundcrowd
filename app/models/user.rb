class User < ActiveRecord::Base
  validates :username, :password_digest, :session_token, presence: true
  validates :username, uniqueness: true
  validates :password, length: { minimum: 6, allow_nil: true }
  include PgSearch
  multisearchable :against => [:username]

  attr_reader :password

  has_many(
  :follows,
  class_name: 'Follow',
  primary_key: :id,
  foreign_key: :user_id
  )

  has_many(
  :follows,
  class_name: 'Follow',
  primary_key: :id,
  foreign_key: :follower_id
  )

  has_many(
  :comments,
  class_name: 'Comment',
  primary_key: :id,
  foreign_key: :user_id
  )

  has_attached_file :image, default_url: "missing.png"
  validates_attachment_content_type :image, content_type: /\Aimage\/.*\Z/

  has_many :followed_users, through: :follows, source: :followed

  has_many :followers, through: :follows, source: :followers

  has_many :recordings, dependent: :destroy

  after_initialize :ensure_session_token


  def self.find_by_credentials(username, password)
    user = User.find_by(username: username)
    return nil unless user && user.valid_password?(password)
    user
  end

  def password=(password)
    @password = password
    self.password_digest = BCrypt::Password.create(password)
  end

  def valid_password?(password)
    BCrypt::Password.new(self.password_digest).is_password?(password)
  end

  def reset_token!
    self.session_token = SecureRandom.urlsafe_base64(16)
    self.save!
    self.session_token
  end

  private

  def ensure_session_token
    self.session_token ||= SecureRandom.urlsafe_base64(16)
  end
end
