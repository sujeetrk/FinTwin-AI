from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(
        String(100),
        nullable=False
    )

    target_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    saved_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    target_date = Column(
        Date,
        nullable=True
    )

    category = Column(
        String(50),
        nullable=True
    )

    user = relationship(
        "User"
    )