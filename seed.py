from sqlalchemy.ext.declarative import DeclarativeMeta
from geoalchemy2.types import Geometry
from sqlalchemy_searchable import make_searchable
from sqlalchemy_utils.types import TSVectorType
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Unicode
from sqlalchemy.orm import sessionmaker, configure_mappers

Base = declarative_base()
make_searchable()


class City(Base):
    __tablename__ = 'city'
    id = Column(Integer, primary_key=True)
    name = Column(Unicode(255))
    country = Column(String(255))
    location = Column(Geometry(geometry_type='POINT', srid=4326)) # SRID=4326;POINT(0.00 0.00)
    search_vector = Column(TSVectorType('name'))

class Interest(Base):
    __tablename__ = 'interest'
    name = Column(Unicode(64), primary_key=True)
    search_vector = Column(TSVectorType('name'))

engine = create_engine('postgresql+psycopg2://chatr:Admin123@localhost/chatr', echo=True)
configure_mappers()
City.__table__.drop(engine)
City.__table__.create(engine)
Interest.__table__.drop(engine)
Interest.__table__.create(engine)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

import codecs

with codecs.open('data.txt', 'r', 'utf-8') as f:
    total = 0
    acc = []
    for line in f:
        tmp = [x.strip() for x in line.split(',')]
        acc.append(dict(name=tmp[2],country=tmp[0], location='SRID=4326;POINT(%s %s)' % (tmp[5], tmp[6])))
        if len(acc) == 100:
            session.bulk_insert_mappings(City, acc)
            acc = []
            total += 100
            if total > 1000:
                break

    if acc:
        session.bulk_insert_mappings(City, acc)

    session.commit()

print('done')
