# verify-email

Verify that an email address actually exist using SMTP.

## Purpose

An email address like `foo@example.com` is valid but doesn’t actually exist. This tool is used to check against the SMTP server if an address is not only valid, but also exists. It doesn’t use any external dependency.

## Usage

```
npm i -g verify-email
verify-email foo@example.com
```

The exit code will be `0` if the email exists, and `1` if an error happens.

## TODO

  * Unit tests
  * Fast invalid email detection using custom rules for major email providers (Gmail, Yahoo, etc.)
  * Library
