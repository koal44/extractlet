
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Why is a linear transformation a $(1,1)$ tensor? -->
<!-- https://math.stackexchange.com/questions/1108842/why-is-a-linear-transformation-a-1-1-tensor -->

## Question
[Wikipedia](http://en.wikipedia.org/wiki/Tensor) says that a linear transformation is a $(1,1)$ tensor. Is this restricting it to transformations from $V$ to $V$ or is a transformation from $V$ to $W$ also a $(1,1)$ tensor? (where $V$ and $W$ are both vector spaces). I think it must be the first case since it also states that a linear functional is a $(0,1)$ tensor and this is a transformation from $V$ to **$R$**. If it is the second case, could you please explain why linear transformations are $(1,1)$ tensors.

[[ Quantum-spaghettification on 2015-01-18 (11 years ago); edited by Zain-Patel on 2016-07-07 (10 years ago) | +30 ]]


### Comment 1
It would be helpful if you told us what definition exactly you have of a (1,1)-tensor.

[[ Mariano-Suárez-Álvarez on 2015-01-18 (11 years ago) | +1 ]]


### Comment 2
@MarianoSuárez-Alvarez I would define it as a element of the vector space $V \bigotimes V^*$ where $V$ is a vector space and $V^*$ its dual

[[ Quantum-spaghettification on 2015-01-18 (11 years ago) | +3 ]]


### Comment 3
Note that I've added a note to that Wikipedia statement now...

[[ got-trolled-too-much-this-week on 2015-01-19 (11 years ago) | +1 ]]


### Comment 4
After tangling a bit on the Wikipedia's article talk page I've discovered that the regulars there have the following agenda/beliefs: (1) tensors are never defined over infinite-dimensional vector spaces and (2) tensors are never defined over different vector spaces (even if finite). As I don't have the time/stamina to battle people with a weird agenda and who are willing to spend most of their waking hours pushing it over there (despite the literature)... my note might be gone soon enough. Which is why reading Wikipedia on any topic is fraught with hazards... even on something as tame as math.

[[ got-trolled-too-much-this-week on 2015-01-19 (11 years ago) | +4 ]]


## Answer 1
It's very common in tensor analysis to associate endomorphisms on a vector space with (1,1) tensors. Namely because there exists an isomorphism between the two sets.

Define $E(V)$ to be the set of endomorphisms on $V$.

Let $A\in E(V)$ and define the map $\Theta:E(V)\rightarrow T^1_1(V)$ by

$$
\begin{align*}
(\Theta A)(\omega,X)&=\omega(AX).
\end{align*}
$$

We show that $\Theta$ is an isomorphism of vector spaces. Let $\{e_i\}$ be a basis for $V$ and let $\{\varepsilon^i\}$ be the corresponding dual basis. First, we note $\Theta$ is linear by the linearity of $\omega$. To show injectivity, suppose $\Theta A = \Theta B$ for some $A,B\in E(V)$ and let $X\in V$, $\omega \in V^*$ be arbitrary. Then

$$
\begin{align*}
(\Theta A)(\omega,X)&=(\Theta B)(\omega,X)\\
\\
\iff \omega(AX-BX)&=0.
\end{align*}
$$

Since $X$ and $\omega$ were arbitrary, it follows that

$$
\begin{align*}
AX&=BX\\
\iff A&=B.
\end{align*}
$$

To show surjectivity, suppose $f\in T^1_1$ has coordinate representation $f^j_i \varepsilon^i \otimes e_j$. We wish to find $A\in E(V)$ such that $\Theta A = f$. We simply choose $A\in E (V)$ such that $A$ has the matrix representation $(f^j_i)$. If we write the representation of our vector $X$ and covector $\omega$ as

$$
\begin{align*}
X&=X^i e_i\\
\omega&=\omega_i \varepsilon^i,
\end{align*}
$$

we have

$$
\begin{align*}
(\Theta A)(\omega, X)&=\omega(AX)\\
\\
&=\omega_k \varepsilon^k(f^j_i X^i e_j)\\
\\
&=f^j_i X^i \omega_k \varepsilon^k (e_j)\\
\\
&=f^j_i X^i \omega_k \delta^k_j\\
\\
&=f^k_i X^i \omega_k.
\end{align*}
$$

However we see

$$
\begin{align*}
f(\omega,X)&=f(\omega_k\varepsilon^k,X^ie_i)\\
\\
&=\omega_k X^i f(\varepsilon^k,e_i)\\
\\
&=f^k_i X^i \omega_k.
\end{align*}
$$

Since $X$ and $\omega$ were arbitrary, it follows that $\Theta A = f$. Thus, $\Theta$ is linear and bijective, hence an isomorphism.

[[ beedge89 on 2015-01-18 (11 years ago); edited by MichaelNgelo on 2016-07-07 (10 years ago) | +20 ]]


### Comment 1
N.B.: This proof is addressing the 2nd part of the OP's question. I'm curious which one he is going to accept given that he [asked two questions in one](http://meta.stackexchange.com/questions/246328/dealing-with-bundle-omnibus-list-of-questions-question-that-consists-of-rather-d)...

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +0 ]]


### Comment 2
Also, this result can be stated more generally for a tensor product of two different vector spaces (i.e., not just for a tensor space), as the existence of an isomorphism between $\mathrm{Hom}(V, W)$ and $V^*\otimes W$.

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +0 ]]


### Comment 3
Also your proof (of surjectivity) does not hold for an infinite-dimensional vector space $V$ because the Kronecker delta formula for covector basis in only valid for finite-dimensional [co]vector spaces.

[[ got-trolled-too-much-this-week on 2015-01-19 (11 years ago) | +2 ]]


### Comment 4
Is there a way to prove this without involving the basis?

[[ MichaelNgelo on 2016-07-07 (10 years ago) | +1 ]]


## Answer 2
Let $T : V \mapsto W$. Then define $\tau: V \times W^* \mapsto K$ such that, for $a \in V$ and $\alpha \in W^*$, we have

$$
\tau(a, \alpha) = (\alpha \circ T)(a)
$$

Note that it's typical to define *tensor* to mean a multilinear map that is a function of vectors only in the same vector space, or of covectors in the associated dual space, or some combination of the two. So, we could identify a linear operator $T: V \mapsto V$ with a $(1,1)$ tensor $\tau: V \times V^* \mapsto K$, but in the case that $V$ and $W$ are distinct vector spaces, these would just be some construction of multilinear maps, not tensors.

[[ Muphrid on 2015-01-18 (11 years ago) | +13 ]]


### Comment 1
Bilinear (and multilinear) maps can be linearized. This is in fact how [Yokonuma's textbook](https://books.google.com/books?id=bDkf3W65-GwC) (pp. 4-7) introduces *tensor product*, so you can define a tensor product for $V$ and $W$ different. This approach is then extended (p. 12) to multilinear maps where all the vector spaces are different. On the other hand, when Yokonuma introduces *tensor space* (p. 33) he defines it as product of copies of the same vector space $V$ and its dual $V*$. It doesn't make sense to speak of a $(i,j)$-type tensor (space) unless it is over the same vector space.

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +0 ]]


### Comment 2
And one more terminology issues worth mentioning here is that a the tensor product of two different vector spaces is sometimes called a [*tensor product space*](https://www.google.com/search?q="tensor+product+space"&btnG=Search+Books&tbm=bks), but this is usually not what people refer to when they use just *tensor space*.

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +1 ]]


### Comment 3
Just to prove that there's an exception to every rule, the Handbook of Linear Algebra (2nd ed., [p. "15-7"](https://books.google.com/books?id=Er7MBQAAQBAJ&pg=SA15-PA7)) does define a "order-*d* tensor" as an element of a tensor product of $d$ different vector spaces. Ha!

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +0 ]]


### Comment 4
And there are physics books that adopt this terminology too. E.g. *Geometry of the Fundamental Interactions* ([p. 48](https://books.google.com/books?id=wEWw_vGBDW8C&pg=PA48)), calls the objects of the tensor product space $U\otimes V$ "second-order tensors".

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago) | +0 ]]


### Comment 5
Can the argument go both ways without assuming that $W$ is reflexive? I.e., starting with a multilinear map $\tau:V \times W^* \rightarrow K$, constructing a linear operator $T:V \rightarrow W$. Without this, we have constructed an isometric embedding, but not an isomorphism. It seems to me the natural linear map associated with a given $\tau$ would be $T:V \mapsto (W^*)^*$. Or maybe I'm missing something..?

[[ Nick-Alger on 2016-09-27 (9 years ago) | +0 ]]


## Answer 3
To summarize as an answer what I wrote in various comments above: first beware that autors differ in their definition of tensor, even when using the same approach, i.e. using the tensor product in this case.

For [some authors](https://books.google.com/books?id=bDkf3W65-GwC&pg=PA33) a tensor is defined only as ...

$$
T\in \underbrace{V \otimes\dots\otimes V}_{n \text{ copies}} \otimes \underbrace{V^* \otimes\dots\otimes V^*}_{m \text{ copies}}
$$

From which it makes sense to speak of a type- $(n,m)$ tensor.

For [others](https://books.google.ro/books?id=Er7MBQAAQBAJ&pg=SA15-PA7), a tensor is any...

$$
T\in V_1 \otimes\dots\otimes V_d
$$

where $V_1, \dots, V_d$ can be different vector spaces, however all must be over the same scalar field. And with this latter definition one can speak of an order- $d$ tensor. A type- $(n,m)$ tensor [in the former sense] is a tensor of order $d=n+m$ in the latter sense, but second definition is broader for it does not restrict us to a single vector space. In particular, a second-order tensor is an element of $V \otimes W$ where $V$ and $W$ may be two different vector spaces. Type-(1,1) tensors are tensors of second order, but the converse of this statement doesn't make sense. (N.B.: I've updated Wikipedia to reflect these different definitions.)

As for your 2nd question, endomorphisms (linear maps) from a vector space to itself are (isomorphic with) type-(1,1) tensors ([detailed proof given here by beedge89](https://math.stackexchange.com/a/1109588/173347)), but if you consider homomorphisms (linear maps) between *different* vector spaces $V$ and $W$, i.e. $\mathrm{Hom}(V,W)$, these are isomorphic with only a certain class of order-2 tensors, namely with $V^* \otimes W$. If we let $(\phi, w)\in V^* \times W$, then the correspondence is given by $\phi \otimes w \leftrightarrow F_{\phi, w}$, where the latter is a (linear) map defined as $F_{\phi, w} (v) = \phi(v)w$. (Remember that [covectors](https://en.wikipedia.org/wiki/Linear_form) are themselves maps from vectors to scalars, so the formula for $F$ makes sense as it's a product of the scalar $\phi(v)$ with the vector $w$). A detailed proof of the fact that this is an isomorphism is given in Yokonuma ([pp. 18-19](https://books.google.com/books?id=bDkf3W65-GwC&pg=PA18)). Apologies for not including it here.

As you may expect, the result for type-(1,1) tensors also follows as a corollary of this, i.e. $\mathrm{Hom}(V,V)$ is isomorphic with $V^* \otimes V$ (and with $V \otimes V^*$ by commutativity of the tensor product, which is also understood in the sense of an isomorphism between $V \otimes W$ and $W \otimes V$ for any vector spaces $V$ and $W$).

And one important caveat here: this is an isomorphism only for finite-dimensional vector spaces. (The introduction of Yokonuma's book actually says to assume all vector spaces in the book are finite-dimensional unless stated otherwise.) If both $V$ and $W$ are infinite-dimensional, then it turns out $V^*\otimes W$ is only a proper subspace of $\mathrm{Hom}(V,W)$, namely it is the subspace of linear transformation of finite [rank](https://en.wikipedia.org/wiki/Rank_%28linear_algebra%29).

And to tie this in with bilinear (and in general with multi-linear) maps: there's also a one-one correspondence between ***bi****linear* maps $f : V\times W \to U$ and $linear$ maps $g : V\otimes W \to U$. (For a proof see for instance [http://www.landsburg.com/algebra.pdf](http://www.landsburg.com/algebra.pdf)) That's why second-order tensors are basically said to be just bilinear maps, and in general why *d*-order tensors are said to be just multi-linear maps.

[[ got-trolled-too-much-this-week on 2015-01-18 (11 years ago); edited by Community on 2017-04-13 (9 years ago) | +11 ]]


### Comment 1
Why does Wikipedia say that a tensor T is a multi-linear map from V ⊗ V... ⊗ V* ⊗ V*... to k (the field)? Your definition seems to be that of a tensor product space.

[[ Yan-King-Yin on 2020-04-20 (6 years ago) | +0 ]]

<!-- XLET-END -->

