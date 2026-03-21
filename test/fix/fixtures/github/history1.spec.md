
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- History for scripts/basic/Makefile - torvalds/linux · GitHub -->
<!-- https://github.com/torvalds/linux/commits/master/scripts/basic/Makefile -->

[torvalds](https://github.com/torvalds) / **[linux](https://github.com/torvalds/linux)** Public

## Breadcrumb

- Repo: `torvalds/linux`
- Ref: `master`
- Path: `scripts/basic/Makefile`

## History

### Commits on May 8, 2025

#### integer-wrap: Force full rebuild when .scl file changes  
[11bb167](https://github.com/torvalds/linux/commit/11bb1678e249e51cd748e8f91e5241b3ce71da3a)  
```
integer-wrap: Force full rebuild when .scl file changes

Since the integer wrapping sanitizer's behavior depends on its associated
.scl file, we must force a full rebuild if the file changes. If not,
instrumentation may differ between targets based on when they were built.

Generate a new header file, integer-wrap.h, any time the Clang .scl
file changes. Include the header file in compiler-version.h when its
associated feature name, INTEGER_WRAP, is defined. This will be picked
up by fixdep and force rebuilds where needed.

Acked-by: Justin Stitt <justinstitt@google.com>
Link: https://lore.kernel.org/r/20250503184623.2572355-3-kees@kernel.org
Reviewed-by: Nicolas Schier <n.schier@avm.de>
Signed-off-by: Kees Cook <kees@kernel.org>
```  
kees committed 2025-05-08 (10 months ago)

### Commits on May 8, 2022

#### randstruct: Move seed generation into scripts/basic/  
[be2b34f](https://github.com/torvalds/linux/commit/be2b34fa9be31c60a95989f984c9a5d40cd781b6)  
```
randstruct: Move seed generation into scripts/basic/

To enable Clang randstruct support, move the structure layout
randomization seed generation out of scripts/gcc-plugins/ into
scripts/basic/ so it happens early enough that it can be used by either
compiler implementation. The gcc-plugin still builds its own header file,
but now does so from the common "randstruct.seed" file.

Cc: linux-hardening@vger.kernel.org
Signed-off-by: Kees Cook <keescook@chromium.org>
Link: https://lore.kernel.org/r/20220503205503.3054173-6-keescook@chromium.org
```  
kees committed 2022-05-08 (4 years ago)

### Commits on Aug 9, 2020

#### kbuild: introduce hostprogs-always-y and userprogs-always-y  
[faabed2](https://github.com/torvalds/linux/commit/faabed295cccc2aba2b67f2e7b309f2892d55004)  
```
kbuild: introduce hostprogs-always-y and userprogs-always-y

To build host programs, you need to add the program names to 'hostprogs'
to use the necessary build rule, but it is not enough to build them
because there is no dependency.

There are two types of host programs: built as the prerequisite of
another (e.g. gen_crc32table in lib/Makefile), or always built when
Kbuild visits the Makefile (e.g. genksyms in scripts/genksyms/Makefile).

The latter is typical in Makefiles under scripts/, which contains host
programs globally used during the kernel build. To build them, you need
to add them to both 'hostprogs' and 'always-y'.

This commit adds hostprogs-always-y as a shorthand.

The same applies to user programs. net/bpfilter/Makefile builds
bpfilter_umh on demand, hence always-y is unneeded. In contrast,
programs under samples/ are added to both 'userprogs' and 'always-y'
so they are always built when Kbuild visits the Makefiles.

userprogs-always-y works as a shorthand.

Signed-off-by: Masahiro Yamada <masahiroy@kernel.org>
Acked-by: Miguel Ojeda <miguel.ojeda.sandonis@gmail.com>
```  
masahir0y committed 2020-08-09 (6 years ago)

### Commits on Feb 3, 2020

#### kbuild: rename hostprogs-y/always to hostprogs/always-y  
[5f2fb52](https://github.com/torvalds/linux/commit/5f2fb52fac15a8a8e10ce020dd532504a8abfc4e)  
```
kbuild: rename hostprogs-y/always to hostprogs/always-y

In old days, the "host-progs" syntax was used for specifying host
programs. It was renamed to the current "hostprogs-y" in 2004.

It is typically useful in scripts/Makefile because it allows Kbuild to
selectively compile host programs based on the kernel configuration.

This commit renames like follows:

  always       ->  always-y
  hostprogs-y  ->  hostprogs

So, scripts/Makefile will look like this:

  always-$(CONFIG_BUILD_BIN2C) += ...
  always-$(CONFIG_KALLSYMS)    += ...
      ...
  hostprogs := $(always-y) $(always-m)

I think this makes more sense because a host program is always a host
program, irrespective of the kernel configuration. We want to specify
which ones to compile by CONFIG options, so always-y will be handier.

The "always", "hostprogs-y", "hostprogs-m" will be kept for backward
compatibility for a while.

Signed-off-by: Masahiro Yamada <masahiroy@kernel.org>
```  
masahir0y committed 2020-02-03 (6 years ago)

### Commits on Aug 29, 2019

#### kbuild: remove unneeded comments and code from scripts/basic/Makefile  
[fc01adc](https://github.com/torvalds/linux/commit/fc01adc41679b19ee35a79e2bd2e9176aeba20c8)  
```
kbuild: remove unneeded comments and code from scripts/basic/Makefile

Kbuild descends into scripts/basic/ even before the Kconfig.
I do not expect any other host programs added to this Makefile.

Signed-off-by: Masahiro Yamada <yamada.masahiro@socionext.com>
```  
masahir0y committed 2019-08-29 (7 years ago)

### Commits on May 21, 2019

#### treewide: Add SPDX license identifier - Makefile/Kconfig  
[ec8f24b](https://github.com/torvalds/linux/commit/ec8f24b7faaf3d4799a7c3f4c1b87f6b02778ad1)  
```
treewide: Add SPDX license identifier - Makefile/Kconfig

Add SPDX license identifiers to all Make/Kconfig files which:

 - Have no license information of any form

These files fall under the project license, GPL v2 only. The resulting SPDX
license identifier is:

  GPL-2.0-only

Signed-off-by: Thomas Gleixner <tglx@linutronix.de>
Signed-off-by: Greg Kroah-Hartman <gregkh@linuxfoundation.org>
```  
KAGA-KOKO authored and gregkh committed 2019-05-21 (7 years ago)

### Commits on Jul 17, 2018

#### kbuild: move bin2c back to scripts/ from scripts/basic/  
[c417fbc](https://github.com/torvalds/linux/commit/c417fbce98722ad7e384caa8ba6f2e7c5f8672d9)  
```
kbuild: move bin2c back to scripts/ from scripts/basic/

Commit 8370edea81e3 ("bin2c: move bin2c in scripts/basic") moved bin2c
to the scripts/basic/ directory, incorrectly stating "Kexec wants to
use bin2c and it wants to use it really early in the build process.
See arch/x86/purgatory/ code in later patches."

Commit bdab125c9301 ("Revert "kexec/purgatory: Add clean-up for
purgatory directory"") and commit d6605b6bbee8 ("x86/build: Remove
unnecessary preparation for purgatory") removed the redundant
purgatory build magic entirely.

That means that the move of bin2c was unnecessary in the first place.

fixdep is the only host program that deserves to sit in the
scripts/basic/ directory.

Signed-off-by: Masahiro Yamada <yamada.masahiro@socionext.com>
```  
masahir0y committed 2018-07-17 (8 years ago)

### Commits on Aug 9, 2017

#### kbuild: trivial cleanups on the comments  
[312a3d0](https://github.com/torvalds/linux/commit/312a3d0918bb7d65862fbbd3e2f2f4630e4d6f56)  
```
kbuild: trivial cleanups on the comments

This is a bunch of trivial fixes and cleanups.

Signed-off-by: Cao jin <caoj.fnst@cn.fujitsu.com>
Signed-off-by: Masahiro Yamada <yamada.masahiro@socionext.com>
```  
Cao jin authored and masahir0y committed 2017-08-09 (9 years ago)

### Commits on Aug 8, 2014

#### kernel: build bin2c based on config option CONFIG_BUILD_BIN2C  
[de5b56b](https://github.com/torvalds/linux/commit/de5b56ba51f63973ceb5c184ee0855f0c8a13fc9)  
```
kernel: build bin2c based on config option CONFIG_BUILD_BIN2C

currently bin2c builds only if CONFIG_IKCONFIG=y. But bin2c will now be
used by kexec too.  So make it compilation dependent on CONFIG_BUILD_BIN2C
and this config option can be selected by CONFIG_KEXEC and CONFIG_IKCONFIG.

Signed-off-by: Vivek Goyal <vgoyal@redhat.com>
Cc: Borislav Petkov <bp@suse.de>
Cc: Michael Kerrisk <mtk.manpages@gmail.com>
Cc: Yinghai Lu <yinghai@kernel.org>
Cc: Eric Biederman <ebiederm@xmission.com>
Cc: H. Peter Anvin <hpa@zytor.com>
Cc: Matthew Garrett <mjg59@srcf.ucam.org>
Cc: Greg Kroah-Hartman <greg@kroah.com>
Cc: Dave Young <dyoung@redhat.com>
Cc: WANG Chao <chaowang@redhat.com>
Cc: Baoquan He <bhe@redhat.com>
Cc: Andy Lutomirski <luto@amacapital.net>
Signed-off-by: Andrew Morton <akpm@linux-foundation.org>
Signed-off-by: Linus Torvalds <torvalds@linux-foundation.org>
```  
rhvgoyal authored and torvalds committed 2014-08-08 (12 years ago)

#### bin2c: move bin2c in scripts/basic  
[8370ede](https://github.com/torvalds/linux/commit/8370edea81e321b8a976969753d6b2811e6d5ed6)  
```
bin2c: move bin2c in scripts/basic

This patch series does not do kernel signature verification yet.  I plan
to post another patch series for that.  Now distributions are already
signing PE/COFF bzImage with PKCS7 signature I plan to parse and verify
those signatures.

Primary goal of this patchset is to prepare groundwork so that kernel
image can be signed and signatures be verified during kexec load.  This
should help with two things.

- It should allow kexec/kdump on secureboot enabled machines.

- In general it can help even without secureboot. By being able to verify
  kernel image signature in kexec, it should help with avoiding module
  signing restrictions. Matthew Garret showed how to boot into a custom
  kernel, modify first kernel's memory and then jump back to old kernel and
  bypass any policy one wants to.

This patch (of 15):

Kexec wants to use bin2c and it wants to use it really early in the build
process. See arch/x86/purgatory/ code in later patches.

So move bin2c in scripts/basic so that it can be built very early and
be usable by arch/x86/purgatory/

Signed-off-by: Vivek Goyal <vgoyal@redhat.com>
Cc: Borislav Petkov <bp@suse.de>
Cc: Michael Kerrisk <mtk.manpages@gmail.com>
Cc: Yinghai Lu <yinghai@kernel.org>
Cc: Eric Biederman <ebiederm@xmission.com>
Cc: H. Peter Anvin <hpa@zytor.com>
Cc: Matthew Garrett <mjg59@srcf.ucam.org>
Cc: Greg Kroah-Hartman <greg@kroah.com>
Cc: Dave Young <dyoung@redhat.com>
Cc: WANG Chao <chaowang@redhat.com>
Cc: Baoquan He <bhe@redhat.com>
Cc: Andy Lutomirski <luto@amacapital.net>
Signed-off-by: Andrew Morton <akpm@linux-foundation.org>
Signed-off-by: Linus Torvalds <torvalds@linux-foundation.org>
```  
rhvgoyal authored and torvalds committed 2014-08-08 (12 years ago)

### Commits on May 2, 2011

#### kbuild: move scripts/basic/docproc.c to scripts/docproc.c  
[bffd202](https://github.com/torvalds/linux/commit/bffd2020a972a188750e5cf4b9566950dfdf25a2)  
```
kbuild: move scripts/basic/docproc.c to scripts/docproc.c

Move docproc from scripts/basic to scripts so it is only built for *doc
targets instead of every time the kernel is built.
```  
pefoley2 authored and michal42 committed 2011-05-02 (15 years ago)

### Commits on Sep 22, 2010

#### jump label: Convert dynamic debug to use jump labels  
[52159d9](https://github.com/torvalds/linux/commit/52159d98be6f26c48f5e02c7ab3c9848a85979b5)  
```
jump label: Convert dynamic debug to use jump labels

Convert the 'dynamic debug' infrastructure to use jump labels.

Signed-off-by: Jason Baron <jbaron@redhat.com>
LKML-Reference: <b77627358cea3e27d7be4386f45f66219afb8452.1284733808.git.jbaron@redhat.com>
Signed-off-by: Steven Rostedt <rostedt@goodmis.org>
```  
jibaron authored and rostedt committed 2010-09-22 (15 years ago)

### Commits on Oct 16, 2008

#### driver core: basic infrastructure for per-module dynamic debug messages  
[346e15b](https://github.com/torvalds/linux/commit/346e15beb5343c2eb8216d820f2ed8f150822b08)  
```
driver core: basic infrastructure for per-module dynamic debug messages

Base infrastructure to enable per-module debug messages.

I've introduced CONFIG_DYNAMIC_PRINTK_DEBUG, which when enabled centralizes
control of debugging statements on a per-module basis in one /proc file,
currently, <debugfs>/dynamic_printk/modules. When, CONFIG_DYNAMIC_PRINTK_DEBUG,
is not set, debugging statements can still be enabled as before, often by
defining 'DEBUG' for the proper compilation unit. Thus, this patch set has no
affect when CONFIG_DYNAMIC_PRINTK_DEBUG is not set.

The infrastructure currently ties into all pr_debug() and dev_dbg() calls. That
is, if CONFIG_DYNAMIC_PRINTK_DEBUG is set, all pr_debug() and dev_dbg() calls
can be dynamically enabled/disabled on a per-module basis.

Future plans include extending this functionality to subsystems, that define 
their own debug levels and flags.

Usage:

Dynamic debugging is controlled by the debugfs file, 
<debugfs>/dynamic_printk/modules. This file contains a list of the modules that
can be enabled. The format of the file is as follows:

	<module_name> <enabled=0/1>
		.
		.
		.

	<module_name> : Name of the module in which the debug call resides
	<enabled=0/1> : whether the messages are enabled or not

For example:

	snd_hda_intel enabled=0
	fixup enabled=1
	driver enabled=0

Enable a module:

	$echo "set enabled=1 <module_name>" > dynamic_printk/modules

Disable a module:

	$echo "set enabled=0 <module_name>" > dynamic_printk/modules

Enable all modules:

	$echo "set enabled=1 all" > dynamic_printk/modules

Disable all modules:

	$echo "set enabled=0 all" > dynamic_printk/modules

Finally, passing "dynamic_printk" at the command line enables
debugging for all modules. This mode can be turned off via the above
disable command.

[gkh: minor cleanups and tweaks to make the build work quietly]

Signed-off-by: Jason Baron <jbaron@redhat.com>
Signed-off-by: Greg Kroah-Hartman <gregkh@suse.de>
```  
jibaron authored and gregkh committed 2008-10-16 (17 years ago)

### Commits on Oct 12, 2007

#### docproc: style & typo cleanups  
[6dd16f4](https://github.com/torvalds/linux/commit/6dd16f44a94798116c4d35be907f7d4c80de4791)  
```
docproc: style & typo cleanups

- fix typos/spellos in docproc.c and Makefile
- add a little whitespace {while, switch} (coding style)
- use NULL instead of 0 for pointer testing

Signed-off-by: Randy Dunlap <randy.dunlap@oracle.com>
Signed-off-by: Sam Ravnborg <sam@ravnborg.org>
```  
rddunlap authored and Sam Ravnborg committed 2007-10-12 (18 years ago)

### Commits on Jun 9, 2006

#### kconfig: integrate split config into silentoldconfig  
[2e3646e](https://github.com/torvalds/linux/commit/2e3646e51b2d6415549b310655df63e7e0d7a080)  
```
kconfig: integrate split config into silentoldconfig

Now that kconfig can load multiple configurations, it becomes simple to
integrate the split config step, by simply comparing the new .config file with
the old auto.conf (and then saving the new auto.conf).  A nice side effect is
that this saves a bit of disk space and cache, as no data needs to be read
from or saved into the splitted config files anymore (e.g.  include/config is
now 648KB instead of 5.2MB).

Signed-off-by: Roman Zippel <zippel@linux-m68k.org>
Signed-off-by: Andrew Morton <akpm@osdl.org>
Signed-off-by: Sam Ravnborg <sam@ravnborg.org>
```  
Roman Zippel authored and Sam Ravnborg committed 2006-06-09 (20 years ago)

### Commits on Apr 16, 2005

#### Linux-2.6.12-rc2  
[1da177e](https://github.com/torvalds/linux/commit/1da177e4c3f41524e886b7f1b8a0c1fc7321cac2)  
```
Linux-2.6.12-rc2

Initial git repository build. I'm not bothering with the full history,
even though we have it. We can create a separate "historical" git
archive of that later if we want to, and in the meantime it's about
3.2GB when imported into git - space that would just make the early
git days unnecessarily complicated, when we don't have a lot of good
infrastructure for it.

Let it rip!
```  
Linus Torvalds committed 2005-04-16 (21 years ago)  
168 comments

<!-- XLET-END -->

