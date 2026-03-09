
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- ${\Lambda}_k(V)$ is spanned by a basis $\mathcal{B}$ -->
<!-- https://math.stackexchange.com/questions/2793701/lambda-kv-is-spanned-by-a-basis-mathcalb -->

## Question
Let $V$ be a vector space over $\mathbb{R}$ and let ${\Lambda}_k(V)$ be the set of all the multilinear-alternating functions from $\prod_{i = 1}^k V$ to $\mathbb{R}$. We are going to suppose that $k \leq n = \dim V$ and $\{v_1 , \ldots , v_n\}$ and $\{v_1^* , \ldots , v_n^*\}$ are basis for $V$ and $V^*$ respectively. Fix $f \in{\Lambda}_k(V)$ and I want to show that

$$
f = \sum_{1\leq i_1 < \ldots < i_k\leq n} {\lambda}_{i_1 , \ldots , i_k} \left(\bigwedge_{j = 1}^k v_{i_j}^*\right)\mbox{,}
$$

being ${\lambda}_{i_1 , \ldots , i_k} = f(v_{i_1}, \ldots , v_{i_k})$, which implies that ${\Lambda}_k(V)$ is spanned by

$$
\mathcal{B} = {\left\{\bigwedge_{j = 1}^k v_{i_j}\right\}}_{1\leq i_1 < \ldots < i_k\leq n}\mbox{.}
$$

In [http://www.maths.adelaide.edu.au/michael.murray/dg_hons/node25.html](http://www.maths.adelaide.edu.au/michael.murray/dg_hons/node25.html) can be found that it is suggested to develop the right member of last equation and it's my attemp about. Fixed $u_j \in V$, $k = 1 , \ldots , k$, I am trying to prove that

$$
\sum_{1\leq i_1 < \ldots < i_k\leq n} {\lambda}_{i_1 , \ldots , i_k} \left(\bigwedge_{j = 1}^k v_{i_j}^*\right)(u_1 , \ldots , u_k) = f(u_1 , \ldots , u_k)\mbox{.}
$$

Well, at first we need to express $u_k$ through the vectors $v_i$, $i = 1 , \ldots , n$. We are going to suppose that

$$
u_j = \sum_{i = 1}^n {\lambda}_i^j v_i \quad \mbox{ for all } \quad j = 1 , \ldots , k\mbox{.}
$$

Therefore,

$$
\sum_{{i_1 , \ldots , i_k \in \{1 , \ldots , n\}} \atop{i_1 < \ldots < i_k}} f(v_{i_1}, \ldots , v_{i_k}) \left(\bigwedge_{l = 1}^k v_{i_l}^*\right)(u_1 , \ldots , u_k) =
$$

$$
= \sum_{{i_1 , \ldots , i_k \in \{1 , \ldots , n\}} \atop{i_1 < \ldots < i_k}} f(v_{i_1}, \ldots , v_{i_k}) \left(\sum_{j_1 , \ldots , j_k \in \{1 , \ldots , n\}} \left(\prod_{l = 1}^k {\lambda}_{j_l}^l\right) \left(\bigwedge_{l = 1}^k v_{i_l}^*\right)(u_1 , \ldots , u_k)\right) =
$$

$$
= \frac{1}{k !} \sum_{{i_1 , \ldots , i_k \in \{1 , \ldots , n\}} \atop{i_1 < \ldots < i_k}} f(v_{i_1}, \ldots , v_{i_k}) \left(\sum_{j_1 , \ldots , j_k \in \{1 , \ldots , n\}} \left(\prod_{l = 1}^k {\lambda}_{j_l}^l\right) \left(\sum_{\sigma \in G_{j_1 , \ldots , j_k}} sgn(\sigma) \left(\prod_{l = 1}^k {\delta}_{i_l , \sigma(j_l)}\right)\right)\right) =
$$

$$
= \frac{1}{k !} \sum_{{i_1 , \ldots , i_k \in \{1 , \ldots , n\}} \atop{i_1 < \ldots < i_k}} f(v_{i_1}, \ldots , v_{i_k}) \left(\sum_{j_1 , \ldots , j_k \in \{1 , \ldots , n\} \atop \sigma \in S_k} sgn(\sigma)\left(\prod_{l = 1}^k {\lambda}_{j_l}^l {\delta}_{i_l , j_{\sigma(l)}}\right)\right)\mbox{,}
$$

where $G_{j_1 , \ldots , j_k} \cong S_k$, being $\psi : S_k \to G_{j_1 , \ldots , j_k}$, given by $\psi : l \mapsto j_l$ an isomorphism ( $G_{j_1 , \ldots , j_k}$ is essentially $S_k$). I do not know how I can continue since here. Thank you very much in advance.

[[ joseabp91 on 2018-05-23 (8 years ago); edited on 2018-05-24 (8 years ago) | +2 ]]


### Comment 1
You can use `1\leq i_1 < \ldots < i_k\leq n` for the result $1\leq i_1 < \ldots < i_k\leq n$, which makes just one line and a less tiny output.

[[ Arnaud-Mortier on 2018-05-23 (8 years ago) | +0 ]]


### Comment 2
Thank you by your suggestion. I have just modified the text.

[[ joseabp91 on 2018-05-23 (8 years ago) | +0 ]]


## Answer 1
I believe that the step

$$
\sum_{1\leq i_1 < \ldots < i_k\leq n} {\lambda}_{i_1 , \ldots , i_k} \left(\bigwedge_{j = 1}^k v_{i_j}^*\right)(u_1 , \ldots , u_k) = \sum_{1\leq i_1 < \ldots < i_k\leq n} {\lambda}_{i_1 , \ldots , i_k} \left(\prod_{j = 1}^k v_{i_j}^*(u_j)\right)
$$

is wrong.

If this were true, for instance you would have

$$
e_1^*\wedge e_2^*(e_2,e_1)=e_1^*(e_2)e_2^*(e_1)=0
$$

instead of the expected

$$
e_1^*\wedge e_2^*(e_2,e_1)=-e_1^*\wedge e_2^*(e_1,e_2)=-1.
$$

So what you need to do is split the $u_i$ before feeding them to the $v_{i_j}^*$.

---

The correct continuation from there is

$$
\sum{\lambda}_{i_1 , \ldots , i_k} \left(\bigwedge_{j = 1}^k v_{i_j}^*\right)(u_1 , \ldots , u_k) =\sum{\lambda}_{i_1 , \ldots , i_k} \left(\bigwedge_{j = 1}^k v_{i_j}^*\right)\left(\sum_{i = 1}^n {\lambda}_i^1 v_i , \ldots , \sum_{i = 1}^n {\lambda}_i^n v_i\right)
$$

Then use multilinearity and consider all ways to select one $v_i$ at a time so as to have exactly the list $\{v_{i_1},\ldots, v_{i_n}\}$ in the end (with a possible minus sign depending on the parity of the permutation).

Note, however, that you don't have to **actually** do this. Only observe that it can be done, and that it can be done in the exact same manner for $f$ since it is multilinear and alternate as well, giving the same coefficients that depend on the matrix $[\lambda_i^j]$.

[[ Arnaud-Mortier on 2018-05-23 (8 years ago); edited on 2018-05-23 (8 years ago) | +1 ]]


### Comment 1
How can I split the $u_i$?

[[ joseabp91 on 2018-05-23 (8 years ago) | +0 ]]


### Comment 2
@joseabp91 You did it already, you defined the coordinates $\lambda_i^j$.

[[ Arnaud-Mortier on 2018-05-23 (8 years ago) | +0 ]]


### Comment 3
So, how can I prove the equality? I do not understand.

[[ joseabp91 on 2018-05-23 (8 years ago) | +0 ]]


### Comment 4
@joseabp91 I edited.

[[ Arnaud-Mortier on 2018-05-23 (8 years ago) | +0 ]]


### Comment 5
I have just developed the right member of your equation using multinilearity but I have obtained the same than before.

[[ joseabp91 on 2018-05-24 (8 years ago) | +0 ]]

<!-- XLET-END -->

