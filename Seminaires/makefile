PHP_FILES = $(wildcard *.php)
HTML_FILES = $(PHP_FILES:.php=.html)

all: $(HTML_FILES)

%.html: %.php %.xml
	php $< > $@

clean:
	rm $(HTML_FILES)
