#Builder stage
FROM python:3.12-slim AS builder
WORKDIR /Revature-Project2-Chess
RUN apt-get update && apt-get install -y curl build-essential
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"
COPY pyproject.toml poetry.lock /Revature-Project2-Chess/
RUN poetry config virtualenvs.create false
RUN poetry install --without dev --no-interaction --no-ansi
ENV PATH="/usr/local/bin:/root/.local/bin:$PATH"
COPY src /Revature-Project2-Chess/src
COPY src/main.py /Revature-Project2-Chess/main.py
COPY alembic.ini /Revature-Project2-Chess/alembic.ini
COPY alembic /Revature-Project2-Chess/alembic

#Produces a smallest IMAGE possible, copy only what we need
#Runtime stage
FROM python:3.12-slim
WORKDIR /Revature-Project2-Chess
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /Revature-Project2-Chess /Revature-Project2-Chess
COPY --from=builder /usr/local/bin /usr/local/bin
ENV PYTHONUNBUFFERED=1
ENV PATH="/usr/local/bin:/root/.local/bin:$PATH"
CMD ["uvicorn", "--reload", "src.main:Revature-Project2-Chess", "--host", "0.0.0.0", "--port", "8000"]

# Purpose of thius file is to describe how to build a docker IMAGE, what code to copy, folders, dependencies, etc