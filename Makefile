.PHONY: resume

# Build the public resume PDF that the site serves.
resume:
	mkdir -p resume/build
	tectonic -X compile resume/resume.tex --outdir resume/build
	cp resume/build/resume.pdf docs/assets/Portfolio_Resume.pdf

