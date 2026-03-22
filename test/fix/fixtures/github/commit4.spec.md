
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- [PATCH] mmtimer build fix · torvalds/linux@8d38ead · GitHub -->
<!-- https://github.com/torvalds/linux/commit/8d38eadb7a97f265f7b3a9e8a30df358c3a546c8 -->

[torvalds](https://github.com/torvalds) / **[linux](https://github.com/torvalds/linux)** Public

# Commit 8d38ead

Christoph Lameter authored and Linus Torvalds committed on 2005-04-16 (21 years ago)

> [PATCH] mmtimer build fix
> 
> Signed-off-by: Christoph Lameter <clameter@sgi.com>
> Signed-off-by: Andrew Morton <akpm@osdl.org>
> Signed-off-by: Linus Torvalds <torvalds@osdl.org>

master · 1 parent 1da177e  
1 file changed · +1 -1 lines changed

## Files changed

- drivers/char
  - mmtimer.c

### drivers/char/mmtimer.c

+1 -1

```
          @@ -485,7 +485,7 @@ void mmtimer_tasklet(unsigned long data) {
485 485   		goto out;
486 486   	t->it_overrun = 0;
487 487  
488     - 	if (tasklist_lock.write_lock || posix_timer_event(t, 0) != 0) {
    488 + 	if (posix_timer_event(t, 0) != 0) {
489 489  
490 490   		// printk(KERN_WARNING "mmtimer: cannot deliver signal.\n");
491 491  
```

## Comments

BardiaAkbari · 2025-03-03 (last year)  
> I just wanna world see me :D

palapapa · 2025-07-06 (9 months ago)  
> I can't see the comments of the first commit because the changed files just keep loading in

Ridwan0110 · 2025-08-07 (8 months ago)  
> @palapapa Lol yes.

<!-- XLET-END -->

