# Developing on Budget US

These instructions are for developing Fishmap_FSE on OS X Lion. It will run on Linux just fine, though some
steps may need tweaking.

## Requirements

* Ruby 1.9.2 with rbenv. [See project](https://github.com/sstephenson/rbenv/) for installation and usage instructions.
* Postgres

## Quick Start

This assumes you have installed rbenv with Ruby 1.9.2-p290, postgres, and that you are a superuser in postgres.

```
$ git clone git://github.com/raulfoo/fishmap.git
$ cd fishmap
$ git checkout fishmap_v5_data_cite
$ bundle install
$ createdb fishmap
[get data from Stanford Data Center (~250mb) and import to tables with the psql_seed.sql script]
$ bundle exec foreman start
```

Now visit http://localhost:8000 and you should be all set.
