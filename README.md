# tashayun

**Tasha Yun**: encrypted folder sync and backup across local disks, SSH and S3, run in ordered steps, with plain-English explanations of every option. A TypeScript/Node command-line tool first, with a GUI planned on top of the same engine.

## Name

Tasha Yun combines two words: Hausa *tasha* (station) and Mandarin Chinese 云 *yún* (cloud), so it means "cloud station" for your files. Hausa is a major West African language spoken mainly in Nigeria and Niger. Pronounced TAH-sha YOON.

## Status

Early development. Two working commands today:

- `tashayun plan` previews a mirror sync between two local folders without changing anything.
- `tashayun pipeline` checks a pipeline file and shows the order its steps would run in.

Everything else is on the roadmap and tracked in the issues tab.

## The idea: ordered pipelines

Real backups are several steps that depend on each other. Example: mirror a folder to a USB drive, then to another machine over SSH, then from that machine to its own USB drive, then zip, encrypt and upload to S3. Step two must not start until step one has finished.

A pipeline file lists the steps and which step each one runs after. The goal is a status view (waiting, running, done, failed) in the CLI and later in a GUI, so a chain like this can be built and tracked with a few clicks.

## Install from source

    git clone https://github.com/RealienLabs/tashayun.git
    cd tashayun
    npm install
    npm run build
    npm link

## Usage

    tashayun --help
    tashayun plan ./source ./destination
    tashayun pipeline examples/pipeline.json

The plan lists files to copy (+), update (~) and delete (-) so the destination matches the source. It is a dry run. The pipeline command prints the order the steps would run in and runs nothing.

## Roadmap

- Apply a mirror sync, then two-way sync with conflict handling
- Run pipelines for real: mirror, zip, encrypt, upload to S3, with status tracking and retry
- Content hashing, exclude patterns
- SSH/SFTP and S3 targets
- Client-side encryption using a vetted library (no custom crypto)
- Plain-English explain command for every option
- S3 bucket setup with plan preview (versioning, lifecycle, IAM)
- GUI: pipeline builder and live status view

See the open issues for the full list.

## Safety

tashayun uses your own SSH and AWS logins. It never stores or transmits credentials, and it does not implement its own cryptography.

## License

MIT
