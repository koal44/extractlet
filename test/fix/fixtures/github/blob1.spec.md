
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- linux/scripts/basic/Makefile at master · torvalds/linux · GitHub -->
<!-- https://github.com/torvalds/linux/blob/master/scripts/basic/Makefile -->

[torvalds](https://github.com/torvalds) / **[linux](https://github.com/torvalds/linux)** Public

## Breadcrumb

- Repo: `torvalds/linux`
- Ref: `master`
- Path: `scripts/basic/Makefile`

## Latest commit

[integer-wrap: Force full rebuild when .scl file changes](https://github.com/torvalds/linux/commit/11bb1678e249e51cd748e8f91e5241b3ce71da3a)

2025-05-08 (10 months ago)

## History

[History](https://github.com/torvalds/linux/commits/master/scripts/basic/Makefile)

## File Content

21 lines (18 loc) · 902 Bytes

```
# SPDX-License-Identifier: GPL-2.0-only
#
# fixdep: used to generate dependency information during build process

hostprogs-always-y	+= fixdep

# randstruct: the seed is needed before building the gcc-plugin or
# before running a Clang kernel build.
gen-randstruct-seed	:= $(srctree)/scripts/gen-randstruct-seed.sh
quiet_cmd_create_randstruct_seed = GENSEED $@
cmd_create_randstruct_seed = \
	$(CONFIG_SHELL) $(gen-randstruct-seed) \
		$@ $(objtree)/include/generated/randstruct_hash.h
$(obj)/randstruct.seed: $(gen-randstruct-seed) FORCE
	$(call if_changed,create_randstruct_seed)
always-$(CONFIG_RANDSTRUCT) += randstruct.seed

# integer-wrap: if the .scl file changes, we need to do a full rebuild.
$(obj)/../../include/generated/integer-wrap.h: $(srctree)/scripts/integer-wrap-ignore.scl FORCE
	$(call if_changed,touch)
always-$(CONFIG_UBSAN_INTEGER_WRAP) += ../../include/generated/integer-wrap.h
```

<!-- XLET-END -->

