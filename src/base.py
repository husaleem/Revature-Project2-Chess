from sqlalchemy.orm import declarative_base

Base = declarative_base()
#This serves as a base class for all models (Book in our case), and provides ease of intgration with ORM, allowing us to use sqlalchemy functions
# in pythonic way, keeps ORM configuration, metadata the same througout the project.