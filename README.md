# Sempervirens Cacher

A way to cache HTML pages in a MongoDB database.

![Tests badge](https://github.com/lukedupuis/sempervirens-cacher/actions/workflows/main.yml/badge.svg?event=push) ![Version badge](https://img.shields.io/static/v1?label=Node&labelColor=30363c&message=16.x&color=blue) ![Version badge](https://img.shields.io/static/v1?label=MongoDB&labelColor=30363c&message=4.4&color=blue)

## Installation

`npm i @sempervirens/dao`

## Usage

1. Configure the Sempervirens DAO.

2. When a request comes to the server for a page for the first time, get the full URL and HTML to be returned.

3. Cache the page to the database with Sempervirens Cacher.

4. When a request comes to the server for the page again, return the HTML from the database rather than re-rendering it.

## API

`url` is a unique key.

### create

Returns a record. If the record already exists, instead of re-rendering the HTML, it returns the existing HTML from the database.

| Prop  | Type | Description |
|-------|------|-------------|
| `url` | string | Required. The full URL from a request for an HTML page resource. |
| `html` | string | Required. The complete HTML body to be returned in the response. |

### find

Returns a record that matches the URL.

| Prop  | Type | Description |
|-------|------|-------------|
| `url` | string | Required. Finds a record by URL. |

### clear

If `url` is given, it clears only the record for the given URL. Otherwise, it clears all records.

| Prop  | Type | Description |
|-------|------|-------------|
| `url` | string | Optional. Clears the record with the given URL. |