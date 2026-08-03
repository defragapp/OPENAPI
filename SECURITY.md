# Security Policy

## Supported production version

Security fixes are applied to the current production line on `main`. Historical branches, archived releases, local forks, and legacy repositories are not supported unless the repository owner states otherwise.

## Report a vulnerability privately

Do not open a public issue, pull request, discussion, or social post containing a suspected vulnerability, secret, exploit, customer data, or reproduction material.

Use GitHub private vulnerability reporting when it is available for this repository. If that option is unavailable, contact the repository owner through an existing verified private channel and request a secure reporting path before sending sensitive details.

Include only what is necessary to reproduce and assess the issue:

- A concise description of the affected behavior.
- The affected production URL, route, component, or commit.
- Reproduction steps that avoid accessing another person's data.
- Expected and observed behavior.
- The likely impact.
- Any temporary mitigation already applied.

Do not include live credentials, private customer content, exact personal-location history, birth records, payment data, authentication cookies, or unnecessary personal information.

## Safe research boundaries

Do not:

- Access, alter, retain, or disclose another person's data.
- Degrade service availability or run high-volume automated tests.
- Attempt social engineering, credential theft, or physical intrusion.
- Test third-party systems that are not owned by Sovereign.OS.
- Publish vulnerability details before remediation and coordinated disclosure.

Stop testing and report privately if you encounter customer data, credentials, or evidence of active exploitation.

## Response process

The repository owner will acknowledge a valid private report as practical, assess severity, preserve relevant evidence, and coordinate remediation and disclosure. Response and resolution timing depends on severity, reproducibility, provider dependencies, and the safety of the required change; this policy does not promise a fixed resolution deadline.

## Secrets and credential exposure

Treat any credential committed to Git, posted in repository metadata, included in build logs, or shared through an unapproved channel as compromised. Removing the visible text is not sufficient. Revoke or rotate the credential, update every legitimate consumer, verify the replacement, and record the incident without recording the secret value.
