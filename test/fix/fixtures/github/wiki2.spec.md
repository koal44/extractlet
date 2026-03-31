
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- 2 Factor Auth for NuGet.org sign in · NuGet/Home Wiki · GitHub -->
<!-- https://github.com/NuGet/Home/wiki/2-Factor-Auth-for-NuGet.org-sign-in -->

# 2 Factor Auth for NuGet.org sign in

Anand Gaurav edited this page 2018-02-27 (8 years ago) · [9 revisions](https://github.com/NuGet/Home/wiki/2-Factor-Auth-for-NuGet.org-sign-in/_history)

Status: **Reviewed**

## Issue

The work for this feature and the discussion around the spec is tracked here:

**2Factor Auth on NuGet Gallery [#3252](https://github.com/NuGet/NuGetGallery/issues/3252)**

## Problem

NuGet.org accounts are currently secured by a simple username/password combination or linked to a Microsoft Account that is similarly protected. We want to make it harder to compromise these accounts by two factor authentication.

## Who is the customer?

All NuGet package authors will be protected by a more enhanced layer of security for public NuGet.org packages

_Authors can still publish package using the existing API keys to NuGet.org. To create a new API key, they may require the advanced security layer via 2-FA, if enabled_

## Key Scenarios

The key scenarios we want to enable are:

- **Deprecate NuGet.org password based accounts.** NuGet.org accounts do not support 2-FA that is critical for enhanced security for Microsoft ecosystems. At NuGet.org, we do not want to build additional 2-FA capability for NuGet.org password based accounts. Instead we would like to leverage existing Microsoft accounts and Azure Active Directory solutions to enable this security functionality. As part of the feature, transition to the new sign-in systems would be seamless. _NuGet.org already supports Microsoft account sign-ins for existing accounts_
- **Enable and encourage enhanced security of NuGet.org accounts using 2-FA**. We will not mandate 2-FA usage for all accounts.
- **NuGet package authors belonging to Organizations with AAD can authenticate on NuGet.org via their AAD instance**. These AAD instances can have 2-FA enabled on them which NuGet.org will respect. _Eg. MSFT packages require mandatory sign-in through secured @microsoft.com accounts federated through Microsoft Organization on AAD similar to our admin accounts._
- Gallery instances (other than NuGet.org) should be able to remain with basic auth using username/password sign-ins.

## Solution

### Personal NuGet.org accounts

We plan to deprecate NuGet.org accounts not linked to Microsoft Accounts and require authentication to NuGet.org accounts via Microsoft Accounts that are secured by 2-FA. We will also support AAD logins.

_For AAD, the experience will be similar to Microsoft Accounts. Clicking on the "Sign in with Microsoft" will lead to a login screen that will redirect to an AAD login if the mail id entered is an AAD account. Nothing else changes._

[**Open**] Do we allow multiple MSA/AAD accounts linked to a single NuGet.org account?

[**Resolved**] A single account on NuGet.org can only be associated with a single MSA/AAD accounts. However, there would be an experience to change the linked MSA/AAD. In addition, there would be no impact to existing NuGet.org accounts linked to multiple MSAs until they try to link additional accounts.

### Organization Accounts

NuGet.org will introduce a light weight "Organization" concept as covered by spec: [Organizations on NuGet.org](https://github.com/NuGet/Home/wiki/Organizations-on-NuGet.org)

## Plan

The aim is to enable 2-FA in phases:

**Phase 1:**

- Enable Microsoft accounts and AAD logins as the default way to login or register on NuGet.org
- Recommend users to enable 2-FA for their accounts
- _NuGet.org password logins will exist but will not be promoted for sign-ins or new user registrations_

Default login:

![image](https://user-images.githubusercontent.com/14800916/30129446-c3a4bc6e-92fa-11e7-86f2-fb11cd87d9af.png)

Encourage linking from NuGet account settings:

![image](https://user-images.githubusercontent.com/14800916/30139690-4d15160a-9324-11e7-9e40-f8ab68a4b2c2.png)

Encourage 2-FA:

![image](https://user-images.githubusercontent.com/14800916/30129499-e646c7d0-92fa-11e7-9fb9-88dfe2e24432.png)

**Phase 2:**

- Deprecate NuGet.org password logins. Ask users to connect with Microsoft/AAD accounts
- Enable **Organizations** on NuGet.org. Spec: [Organizations on NuGet.org](https://github.com/NuGet/Home/wiki/TBD)

Deprecate NuGet.org password login with migration path to MSA/AAD:

![image](https://user-images.githubusercontent.com/14800916/30301386-505b12da-970f-11e7-812a-32cbdd2685f2.png)

**Phase 3:**

- Disable NuGet.org password sign-ins. Enforce all accounts to connect with Microsoft accounts or AAD with 2FA.

NuGet.org password sign-in is disabled:

![image](https://user-images.githubusercontent.com/14800916/30339210-20a952f6-97a3-11e7-91ce-ffaae53ed0bc.png)

**Note**: Manage Organizations, Manage packages and Upload package are disabled

![image](https://user-images.githubusercontent.com/14800916/30339136-e8f0cbf0-97a2-11e7-9406-8ace75ce2188.png)

# Pages

- Home
- 2 Factor Auth for NuGet.org sign in
  - Issue
  - Problem
  - Who is the customer?
  - Key Scenarios
  - Solution
  - Personal NuGet.org accounts
  - Organization Accounts
  - Plan
- [Spec] Content v2 for project.json
- [Spec] Deterministic Pack
- [Spec] Fallback package folders
- [Spec] FrameworkReference in NuGet
- [Spec] Machine readable output for dotnet list package
- [Spec] Managing dependency package assets
- [Spec] MSBuild restore target
- [Spec] NuGet Build Integrated Project handling of floating versions and ranges in Visual Studio Client
- [Spec] NuGet Config schema changes to enable trusted signers
- [Spec] NuGet Package Signing Client Policy
- [Spec] NuGet Package Signing Revocation Check
- [Spec] NuGet settings in MSBuild
- [spec] NuGet.org replication API
- [Spec] Package download API
- [Spec] PackageDownload support
- [Spec] Server side warnings for NuGet client
- [spec] Support organizational accounts
- [Spec] Transitive Warning Properties
- [Spec] UI Delay during ISettings initialization
- [Spec] Warnings and errors in the assets file
- Add Clear Cache button to VS Package Manager options
- Add nuget sources command to the dotnet CLI
- Adding nuget pack as a msbuild target
- Advanced Search on NuGet.org
- Aggressive No Caching option for nuget.exe
- Allow package authors to define build assets transitive behavior
- Allow restore to succeed for unloaded projects in Visual Studio
- Author Package Signing
- Azure DevOps Artifacts authentication issues
- Backporting PC to msbuild restore
- Batch Events
- Bringing back content support, September 24th, 2015
- Centrally managing NuGet package versions
- Centrally managing NuGet packages
- Centrally managing NuGet packages and versions
- Config Max Http Request In NuGet
- Consolidate NuGet CLIs (commands and functionality)
- Contribute to NuGet
- Converting a csproj from package.config to project.json
- Converting Extension SDKs into NuGet Packages
- Cross platform authentication support
- Csproj to Xproj reference design meeting notes September 2, 2015
- Deprecate external content URLs for packages
- Deprecate packages
- DevelopmentDependency support for PackageReference
- dotnet list package
- dotnet list package vulnerable
- DotnetCliToolReference restore
- DotNetCliTools in VS _15_ timeframe
- Embed Interop Types with PackageReference
- Embedding and displaying NuGet READMEs
- Enable .NET Core 2.0 projects to work with .NET Framework 4.6.1 compatible packages
- Enable repeatable builds for PackageReference based projects
- Enable repeatable package restore using lock file
- Enhanced package upload workflow
- Filter OData query requests
- Full support of LSL
- Global Tools NuGet Implementation
- Icons as part of the nupkg
- Ideas about NuGet Hierarchical Setting
- Implemented
- Improve messaging when NuGet service(s) are degraded
- Incubation
- IsLatest Duplicates
- LineUps file to manage package dependencies for a repo
- Lock file design meeting notes August 18, 2015
- Logging Guidance
- Manage allowed packages for a solution (or globally)
- MsBuild project.json xunit Design meeting notes August, 12 2015
- Multiple API Keys
- MVP Summit 2020
- NuGet Account Deletion Workflow
- NuGet Account Deletion Workflow (deprecated)
- NuGet Account Deletion Workflow (Self Service Model)
- NuGet Account Deletion Workflow (Service Request Model)
- NuGet Client Package Debugging
- NuGet Client Test Plan
- NuGet cross plat authentication plugin
- NuGet Errors and Warnings
- NuGet Gallery Test Plan
- NuGet Localization Design
- NuGet Package Debugging & Symbols Improvements
- NuGet Package Download Plugin
- NuGet Package Identity Verification
- NuGet package signing Errors and Warnings
- NuGet packages cache management
- NuGet Restore Manager
- NuGet Restore No Op
- NuGet Sign Command
- NuGet UI design meeting notes August 20 2015
- NuGet UI design meeting notes August 21, 2015
- NuGet Upgrader. Helping to move to NuGet 3.0
- NuGet Verify Command
- nuget.exe, xplat, dotnet cli commands and options planning
- nuget.org not used on new machine
- NuGetGallery DB Query performance investigations
- NuGetizer 3000
- NuGetizer Core Features
- NuGetizer Core Scenarios
- NuGetizer Future Features
- NuGetizer Principles
- Nupkg Metadata File
- Organization policies and 2FA settings
- Organizations on NuGet.org
- Package applicability in NuGet package manager UI
- Package Immutability
- Package Markdown Support
- Package ownership information on nuget.org
- Package README.md support
- Package Signatures Technical Details
- Package signing
- Package Sources Diagnostics
- Package Type [Packing]
- PackageReference enhancements
- PackageReference Specification
- packages.config (PC) to PackageReference (PR) Migrator
- Packages.config SHA Validation
- PackageTargetFallback (new design for Imports)
- Packaging Icon within the nupkg
- Packaging Icon, License and Documentation within the nupkg
- Packaging License within the nupkg
- Packaging License within the nupkg (Technical Spec)
- Plugin Diagnostic Logging
- Redesign nuget.org search on top of Azure Search
- Register package signing certificates
- Repeatable build using lock file implementation
- Repository Signatures
- Repository Signatures and Countersignatures Technical Specification
- Restore errors and warnings
- Search by Package Type and Query Language Surfacing
- Search improvements for packages that have been renamed or split
- Secret Rotation
- Semver 2.0.0 Protocol
- SemVer 2.0.0 support
- SemVer2 support for nuget.org (server side)
- Show outdated packages
- Show source repository information for packages on nuget.org
- Showing dependent packages on NuGet.org (Used By)
- Sidebar Archive 9_14_2017
- Signing certificate is not trusted by the trust provider
- Submitting Bugs and Suggestions
- Support dotnet add, update, remove pkg
- Support locals command in dotnet cli
- Support nuget push scenarios in dotnet CLI
- Support package renames
- Support pre release packages with floating versions
- Supporting locals command in dotnet cli and VS extension
- Supporting Package Reference in UWP WPF WinForms and Classic Libraries
- Surfacing PackageType as part of NuGet search protocol
- Symbols Package Upload and Delete Workflow
- ToolsReference and Multi TFM Support in NuGet UI
- Update Command in Context Menu
- UWP Project Json Upgrader
- Warnings and Errors Combined Specs

<!-- XLET-END -->

