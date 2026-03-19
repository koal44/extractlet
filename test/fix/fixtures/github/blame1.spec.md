
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Blaming linux/scripts/basic/Makefile at master · torvalds/linux · GitHub -->
<!-- https://github.com/torvalds/linux/blame/master/scripts/basic/Makefile -->

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

## File Info

21 lines (18 loc) · 902 Bytes

## Blame

### Line 1

[treewide: Add SPDX license identifier - Makefile/Kconfig](https://github.com/torvalds/linux/commit/ec8f24b7faaf3d4799a7c3f4c1b87f6b02778ad1)  
u/171241280 · 2019-05-21 (7 years ago)  
```
# SPDX-License-Identifier: GPL-2.0-only
```

### Lines 2-3

[kbuild: remove unneeded comments and code from scripts/basic/Makefile](https://github.com/torvalds/linux/commit/fc01adc41679b19ee35a79e2bd2e9176aeba20c8)  
u/781636 · 2019-08-29 (7 years ago)  
```
#
# fixdep: used to generate dependency information during build process
```

### Line 4

[Linux-2.6.12-rc2](https://github.com/torvalds/linux/commit/1da177e4c3f41524e886b7f1b8a0c1fc7321cac2)  
2005-04-16 (21 years ago)  
```

```

### Line 5

[kbuild: introduce hostprogs-always-y and userprogs-always-y](https://github.com/torvalds/linux/commit/faabed295cccc2aba2b67f2e7b309f2892d55004)  
u/781636 · 2020-08-09 (6 years ago)  
```
hostprogs-always-y	+= fixdep
```

### Lines 6-16

[randstruct: Move seed generation into scripts/basic/](https://github.com/torvalds/linux/commit/be2b34fa9be31c60a95989f984c9a5d40cd781b6)  
u/1110841 · 2022-05-08 (4 years ago)  
```

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
```

### Lines 17-21

[integer-wrap: Force full rebuild when .scl file changes](https://github.com/torvalds/linux/commit/11bb1678e249e51cd748e8f91e5241b3ce71da3a)  
u/1110841 · 2025-05-08 (10 months ago)  
```

# integer-wrap: if the .scl file changes, we need to do a full rebuild.
$(obj)/../../include/generated/integer-wrap.h: $(srctree)/scripts/integer-wrap-ignore.scl FORCE
	$(call if_changed,touch)
always-$(CONFIG_UBSAN_INTEGER_WRAP) += ../../include/generated/integer-wrap.h
```

<!-- XLET-END -->

