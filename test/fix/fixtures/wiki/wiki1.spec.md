
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Tensor -->
<!-- https://en.wikipedia.org/wiki/Tensor -->

# Tensor
For other uses, see [Tensor (disambiguation)](https://en.wikipedia.org/wiki/Tensor_%28disambiguation%29).

This article is about tensors on a single vector space and is not to be confused with [Vector field](https://en.wikipedia.org/wiki/Vector_field) or [Tensor field](https://en.wikipedia.org/wiki/Tensor_field).

:::figure  
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/330px-Components_stress_tensor.svg.png)](https://en.wikipedia.org/wiki/File:Components_stress_tensor.svg)

The second-order [Cauchy stress tensor](https://en.wikipedia.org/wiki/Cauchy_stress_tensor) $\mathbf{T}$ describes the stress experienced by a material at a given point. For any unit vector $\mathbf{v}$, the product $\mathbf{T} \cdot \mathbf{v}$ is a vector, denoted $\mathbf{T} (\mathbf{v} )$, that quantifies the force per area along the plane perpendicular to $\mathbf{v}$. This image shows, for cube faces perpendicular to $\mathbf{e}_{1},\mathbf{e}_{2},\mathbf{e}_{3}$, the corresponding stress vectors $\mathbf{T} (\mathbf{e}_{1}),\mathbf{T} (\mathbf{e}_{2}),\mathbf{T} (\mathbf{e}_{3})$ along those faces. Because the stress tensor takes one vector as input and gives one vector as output, it is a second-order tensor.

:::

In [mathematics](https://en.wikipedia.org/wiki/Mathematics "Mathematics"), a **tensor** is an [algebraic object](https://en.wikipedia.org/wiki/Mathematical_object "Mathematical object") that describes a [multilinear](https://en.wikipedia.org/wiki/Multilinear_map "Multilinear map") relationship between sets of [algebraic objects](https://en.wikipedia.org/wiki/Algebraic_structure "Algebraic structure") associated with a [vector space](https://en.wikipedia.org/wiki/Vector_space "Vector space"). Tensors may map between different objects such as [vectors](https://en.wikipedia.org/wiki/Vector_%28mathematics_and_physics%29 "Vector (mathematics and physics)"), [scalars](https://en.wikipedia.org/wiki/Scalar_%28mathematics%29 "Scalar (mathematics)"), and even other tensors. There are many types of tensors, including [scalars](https://en.wikipedia.org/wiki/Scalar_%28mathematics%29 "Scalar (mathematics)") and [vectors](https://en.wikipedia.org/wiki/Vector_%28mathematics_and_physics%29 "Vector (mathematics and physics)") (which are the simplest tensors), [dual vectors](https://en.wikipedia.org/wiki/Dual_vector "Dual vector"), [multilinear maps](https://en.wikipedia.org/wiki/Multilinear_map "Multilinear map") between vector spaces, and even some operations such as the [dot product](https://en.wikipedia.org/wiki/Dot_product "Dot product"). Tensors are defined [independent](https://en.wikipedia.org/wiki/Tensor_%28intrinsic_definition%29 "Tensor (intrinsic definition)") of any [basis](https://en.wikipedia.org/wiki/Basis_%28linear_algebra%29 "Basis (linear algebra)"), although they are often referred to by their components in a basis related to a particular coordinate system; those components form an array, which can be thought of as a high-dimensional [matrix](https://en.wikipedia.org/wiki/Matrix_%28mathematics%29 "Matrix (mathematics)").

Tensors have become important in [physics](https://en.wikipedia.org/wiki/Physics "Physics") because they provide a concise mathematical framework for formulating and solving physics problems in areas such as [mechanics](https://en.wikipedia.org/wiki/Mechanics "Mechanics") ([stress](https://en.wikipedia.org/wiki/Stress_%28mechanics%29 "Stress (mechanics)"), [elasticity](https://en.wikipedia.org/wiki/Elasticity_%28physics%29 "Elasticity (physics)"), [quantum mechanics](https://en.wikipedia.org/wiki/Quantum_mechanics "Quantum mechanics"), [fluid mechanics](https://en.wikipedia.org/wiki/Fluid_mechanics "Fluid mechanics"), [moment of inertia](https://en.wikipedia.org/wiki/Moment_of_inertia "Moment of inertia"), ...), [electrodynamics](https://en.wikipedia.org/wiki/Classical_electromagnetism "Classical electromagnetism") ([electromagnetic tensor](https://en.wikipedia.org/wiki/Electromagnetic_tensor "Electromagnetic tensor"), [Maxwell tensor](https://en.wikipedia.org/wiki/Maxwell_stress_tensor "Maxwell stress tensor"), [permittivity](https://en.wikipedia.org/wiki/Permittivity "Permittivity"), [magnetic susceptibility](https://en.wikipedia.org/wiki/Magnetic_susceptibility "Magnetic susceptibility"), ...), and [general relativity](https://en.wikipedia.org/wiki/General_relativity "General relativity") ([stress–energy tensor](https://en.wikipedia.org/wiki/Stress–energy_tensor "Stress–energy tensor"), [curvature tensor](https://en.wikipedia.org/wiki/Riemann_curvature_tensor "Riemann curvature tensor"), ...). In applications, it is common to study situations in which a different tensor can occur at each point of an object; for example the stress within an object may vary from one location to another. This leads to the concept of a [tensor field](https://en.wikipedia.org/wiki/Tensor_field "Tensor field"). In some areas, tensor fields are so ubiquitous that they are often simply called "tensors".

[Tullio Levi-Civita](https://en.wikipedia.org/wiki/Tullio_Levi-Civita) and [Gregorio Ricci-Curbastro](https://en.wikipedia.org/wiki/Gregorio_Ricci-Curbastro) popularised tensors in 1900 – continuing the earlier work of [Bernhard Riemann](https://en.wikipedia.org/wiki/Bernhard_Riemann), [Elwin Bruno Christoffel](https://en.wikipedia.org/wiki/Elwin_Bruno_Christoffel), and others – as part of the *[absolute differential calculus](https://en.wikipedia.org/wiki/Absolute_differential_calculus "Absolute differential calculus")*. The concept enabled an alternative formulation of the intrinsic [differential geometry](https://en.wikipedia.org/wiki/Differential_geometry "Differential geometry") of a [manifold](https://en.wikipedia.org/wiki/Manifold "Manifold") in the form of the [Riemann curvature tensor](https://en.wikipedia.org/wiki/Riemann_curvature_tensor).[\[1\]](#cite_note-Kline-1)


## Definition
:::figure  
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Tensor_dimensions.svg/330px-Tensor_dimensions.svg.png)](https://en.wikipedia.org/wiki/File:Tensor_dimensions.svg)

Comparison of the first five orders of tensors

:::

Although seemingly different, the various approaches to defining tensors describe the same geometric concept using different language and at different levels of abstraction.


### As multidimensional arrays
A tensor may be represented as a (potentially multidimensional) array. Just as a [vector](https://en.wikipedia.org/wiki/Vector_space "Vector space") in an $n$-[dimensional](https://en.wikipedia.org/wiki/Dimension_%28vector_space%29 "Dimension (vector space)") space is represented by a [one-dimensional](https://en.wikipedia.org/wiki/Multidimensional_array "Multidimensional array") array with $n$ components with respect to a given [basis](https://en.wikipedia.org/wiki/Basis_%28linear_algebra%29#Ordered_bases_and_coordinates "Basis (linear algebra)"), any tensor with respect to a basis is represented by a multidimensional array. For example, a [linear operator](https://en.wikipedia.org/wiki/Linear_operator "Linear operator") is represented in a basis as a two-dimensional square $n × n$ array. The numbers in the multidimensional array are known as the *components* of the tensor. They are denoted by indices giving their position in the array, as [subscripts and superscripts](https://en.wikipedia.org/wiki/Subscript_and_superscript "Subscript and superscript"), following the symbolic name of the tensor. For example, the components of an order-$2$ tensor $T$ could be denoted $T_{ij}$ , where $i$ and $j$ are indices running from $1$ to $n$, or also by $T^{i}_{j}$. Whether an index is displayed as a superscript or subscript depends on the transformation properties of the tensor, described below. Thus while $T_{ij}$ and $T^{i}_{j}$ can both be expressed as *n*-by-*n* matrices, and are numerically related via [index juggling](https://en.wikipedia.org/wiki/Raising_and_lowering_indices "Raising and lowering indices"), the difference in their transformation laws indicates it would be improper to add them together.

The total number of indices ($m$) required to identify each component uniquely is equal to the *dimension* or the number of *ways* of an array, which is why a tensor is sometimes referred to as an $m$-dimensional array or an $m$-way array. The total number of indices is also called the *order*, *degree* or *rank* of a tensor,[\[2\]](#cite_note-DeLathauwerEtAl2000-2)[\[3\]](#cite_note-Vasilescu2002Tensorfaces-3)[\[4\]](#cite_note-KoldaBader2009-4) although the term "rank" generally has [another meaning](https://en.wikipedia.org/wiki/Tensor_rank "Tensor rank") in the context of matrices and tensors.

Just as the components of a vector change when we change the [basis](https://en.wikipedia.org/wiki/Basis_%28linear_algebra%29 "Basis (linear algebra)") of the vector space, the components of a tensor also change under such a transformation. Each type of tensor comes equipped with a *transformation law* that details how the components of the tensor respond to a [change of basis](https://en.wikipedia.org/wiki/Change_of_basis "Change of basis"). The components of a vector can respond in two distinct ways to a [change of basis](https://en.wikipedia.org/wiki/Change_of_basis "Change of basis") (see *[Covariance and contravariance of vectors](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors)*), where the new [basis vectors](https://en.wikipedia.org/wiki/Basis_vectors "Basis vectors") $\mathbf{\hat{e}}_{i}$ are expressed in terms of the old basis vectors $\mathbf{e}_{j}$ as,

$$
\mathbf{\hat{e}}_{i}=\sum_{j=1}^{n}\mathbf{e}_{j}R_{i}^{j}=\mathbf{e}_{j}R_{i}^{j}.
$$

Here *R*^{*j*}_{*i*} are the entries of the change of basis matrix, and in the rightmost expression the [summation](https://en.wikipedia.org/wiki/Summation "Summation") sign was suppressed: this is the [Einstein summation convention](https://en.wikipedia.org/wiki/Einstein_summation_convention), which will be used throughout this article.[\[Note 1\]](#cite_note-5) The components *v*^{*i*} of a column vector **v** transform with the [inverse](https://en.wikipedia.org/wiki/Matrix_inverse "Matrix inverse") of the matrix *R*,

$$
{\hat{v}}^{i}=\left(R^{-1}\right)_{j}^{i}v^{j},
$$

where the hat denotes the components in the new basis. This is called a *contravariant* transformation law, because the vector components transform by the *inverse* of the change of basis. In contrast, the components, *w*_{*i*}, of a covector (or row vector), **w**, transform with the matrix *R* itself,

$$
{\hat{w}}_{i}=w_{j}R_{i}^{j}.
$$

This is called a *covariant* transformation law, because the covector components transform by the *same matrix* as the change of basis matrix. The components of a more general tensor are transformed by some combination of covariant and contravariant transformations, with one transformation law for each index. If the transformation matrix of an index is the inverse matrix of the basis transformation, then the index is called *contravariant* and is conventionally denoted with an upper index (superscript). If the transformation matrix of an index is the basis transformation itself, then the index is called *covariant* and is denoted with a lower index (subscript).

As a simple example, the matrix of a linear operator with respect to a basis is a rectangular array $T$ that transforms under a change of basis matrix $R=\left(R_{i}^{j}\right)$ by ${\hat{T}}=R^{-1}TR$. For the individual matrix entries, this transformation law has the form ${\hat{T}}_{j'}^{i'}=\left(R^{-1}\right)_{i}^{i'}T_{j}^{i}R_{j'}^{j}$ so the tensor corresponding to the matrix of a linear operator has one covariant and one contravariant index: it is of type (1,1).

Combinations of covariant and contravariant components with the same index allow us to express geometric invariants. For example, the fact that a vector is the same object in different coordinate systems can be captured by the following equations, using the formulas defined above:

$$
{\displaystyle \mathbf{v} ={\hat{v}}^{i}\,\mathbf{\hat{e}}_{i}=\left(\left(R^{-1}\right)_{j}^{i}{v}^{j}\right)\left(\mathbf{e}_{k}R_{i}^{k}\right)=\left(\left(R^{-1}\right)_{j}^{i}R_{i}^{k}\right){v}^{j}\mathbf{e}_{k}=\delta_{j}^{k}{v}^{j}\mathbf{e}_{k}={v}^{k}\,\mathbf{e}_{k}={v}^{i}\,\mathbf{e}_{i}},
$$

where $\delta_{j}^{k}$ is the [Kronecker delta](https://en.wikipedia.org/wiki/Kronecker_delta), which functions similarly to the [identity matrix](https://en.wikipedia.org/wiki/Identity_matrix "Identity matrix"), and has the effect of renaming indices (*j* into *k* in this example). This shows several features of the component notation: the ability to re-arrange terms at will ([commutativity](https://en.wikipedia.org/wiki/Commutativity "Commutativity")), the need to use different indices when working with multiple objects in the same expression, the ability to rename indices, and the manner in which contravariant and covariant tensors combine so that all instances of the transformation matrix and its inverse cancel, so that expressions like ${v}^{i}\,\mathbf{e}_{i}$ can immediately be seen to be geometrically identical in all coordinate systems.

Similarly, a linear operator, viewed as a geometric object, does not actually depend on a basis: it is just a linear map that accepts a vector as an argument and produces another vector. The transformation law for how the matrix of components of a linear operator changes with the basis is consistent with the transformation law for a contravariant vector, so that the action of a linear operator on a contravariant vector is represented in coordinates as the matrix product of their respective coordinate representations. That is, the components $(Tv)^{i}$ are given by $(Tv)^{i}=T_{j}^{i}v^{j}$. These components transform contravariantly, since

$$
\left({\widehat{Tv}}\right)^{i'}={\hat{T}}_{j'}^{i'}{\hat{v}}^{j'}=\left[\left(R^{-1}\right)_{i}^{i'}T_{j}^{i}R_{j'}^{j}\right]\left[\left(R^{-1}\right)_{k}^{j'}v^{k}\right]=\left(R^{-1}\right)_{i}^{i'}(Tv)^{i}.
$$

The transformation law for an order $p + q$ tensor with *p* contravariant indices and *q* covariant indices is thus given as,

$$
{\hat{T}}_{j'_{1},\ldots ,j'_{q}}^{i'_{1},\ldots ,i'_{p}}=\left(R^{-1}\right)_{i_{1}}^{i'_{1}}\cdots \left(R^{-1}\right)_{i_{p}}^{i'_{p}}
T_{j_{1},\ldots ,j_{q}}^{i_{1},\ldots ,i_{p}}
R_{j'_{1}}^{j_{1}}\cdots R_{j'_{q}}^{j_{q}}.
$$

Here the primed indices denote components in the new coordinates, and the unprimed indices denote the components in the old coordinates. Such a tensor is said to be of order or *type* $(p, q)$. The terms "order", "type", "rank", "valence", and "degree" are all sometimes used for the same concept. Here, the term "order" or "total order" will be used for the total dimension of the array (or its generalization in other definitions), $p + q$ in the preceding example, and the term "type" for the pair giving the number of contravariant and covariant indices. A tensor of type $(p, q)$ is also called a $(p, q)$-tensor for short.

This discussion motivates the following formal definition:[\[5\]](#cite_note-Sharpe2000-6)[\[6\]](#cite_note-7)

> **Definition.** A tensor of type (*p*, *q*) is an assignment of a multidimensional array
> 
> $$
> T_{j_{1}\dots j_{q}}^{i_{1}\dots i_{p}}[\mathbf{f} ]
> $$
> 
> to each basis $f = (e_{1}, ..., e_{n})$ of an *n*-dimensional vector space such that, if we apply the change of basis
> 
> $$
> \mathbf{f} \mapsto \mathbf{f} \cdot R=\left(\mathbf{e}_{i}R_{1}^{i},\dots ,\mathbf{e}_{i}R_{n}^{i}\right)
> $$
> 
> then the multidimensional array obeys the transformation law
> 
> $$
> T_{j'_{1}\dots j'_{q}}^{i'_{1}\dots i'_{p}}[\mathbf{f} \cdot R]=\left(R^{-1}\right)_{i_{1}}^{i'_{1}}\cdots \left(R^{-1}\right)_{i_{p}}^{i'_{p}}
> T_{j_{1},\ldots ,j_{q}}^{i_{1},\ldots ,i_{p}}[\mathbf{f} ]
> R_{j'_{1}}^{j_{1}}\cdots R_{j'_{q}}^{j_{q}}.
> $$

The definition of a tensor as a multidimensional array satisfying a transformation law traces back to the work of Ricci.[\[1\]](#cite_note-Kline-1)

An equivalent definition of a tensor uses the [representations](https://en.wikipedia.org/wiki/Representation_theory "Representation theory") of the [general linear group](https://en.wikipedia.org/wiki/General_linear_group "General linear group"). There is an [action](https://en.wikipedia.org/wiki/Group_action_%28mathematics%29 "Group action (mathematics)") of the general linear group on the set of all [ordered bases](https://en.wikipedia.org/wiki/Ordered_basis "Ordered basis") of an *n*-dimensional vector space. If $\mathbf{f} =(\mathbf{f}_{1},\dots ,\mathbf{f}_{n})$ is an ordered basis, and $R=\left(R_{j}^{i}\right)$ is an invertible $n\times n$ matrix, then the action is given by

$$
\mathbf{f} R=\left(\mathbf{f}_{i}R_{1}^{i},\dots ,\mathbf{f}_{i}R_{n}^{i}\right).
$$

Let *F* be the set of all ordered bases. Then *F* is a [principal homogeneous space](https://en.wikipedia.org/wiki/Principal_homogeneous_space "Principal homogeneous space") for GL(*n*). Let *W* be a vector space and let $\rho$ be a representation of GL(*n*) on *W* (that is, a [group homomorphism](https://en.wikipedia.org/wiki/Group_homomorphism "Group homomorphism") $\rho :{\text{GL}}(n)\to{\text{GL}}(W)$). Then a tensor of type $\rho$ is an [equivariant map](https://en.wikipedia.org/wiki/Equivariant_map "Equivariant map") $T:F\to W$. Equivariance here means that

$$
T(FR)=\rho \left(R^{-1}\right)T(F).
$$

When $\rho$ is a [tensor representation](https://en.wikipedia.org/wiki/Tensor_representation "Tensor representation") of the general linear group, this gives the usual definition of tensors as multidimensional arrays. This definition is often used to describe tensors on manifolds,[\[7\]](#cite_note-8) and readily generalizes to other groups.[\[5\]](#cite_note-Sharpe2000-6)


### As multilinear maps
Main article: [Multilinear map](https://en.wikipedia.org/wiki/Multilinear_map)

A downside to the definition of a tensor using the multidimensional array approach is that it is not apparent from the definition that the defined object is indeed basis independent, as is expected from an intrinsically geometric object. Although it is possible to show that transformation laws indeed ensure independence from the basis, sometimes a more intrinsic definition is preferred. One approach that is common in [differential geometry](https://en.wikipedia.org/wiki/Differential_geometry "Differential geometry") is to define tensors relative to a fixed (finite-dimensional) vector space *V*, which is usually taken to be a particular vector space of some geometrical significance like the [tangent space](https://en.wikipedia.org/wiki/Tangent_space "Tangent space") to a manifold.[\[8\]](#cite_note-9) In this approach, a type (*p*, *q*) tensor *T* is defined as a [multilinear map](https://en.wikipedia.org/wiki/Multilinear_map "Multilinear map"),

$$
T:\underbrace{V^{*}\times \dots \times V^{*}}_{p{\text{ copies}}}\times \underbrace{V\times \dots \times V}_{q{\text{ copies}}}\rightarrow \mathbb{R},
$$

where *V*^∗ is the corresponding [dual space](https://en.wikipedia.org/wiki/Dual_space "Dual space") of covectors, which is linear in each of its arguments. The above assumes *V* is a vector space over the [real numbers](https://en.wikipedia.org/wiki/Real_number "Real number"), ⁠$\mathbb{R}$⁠. More generally, *V* can be taken over any [field](https://en.wikipedia.org/wiki/Field_%28mathematics%29 "Field (mathematics)") *F* (e.g. the [complex numbers](https://en.wikipedia.org/wiki/Complex_number "Complex number")), with *F* replacing ⁠$\mathbb{R}$⁠ as the codomain of the multilinear maps.

By applying a multilinear map *T* of type (*p*, *q*) to a basis {**e**_{*j*}} for *V* and a canonical cobasis {**ε**^{*i*}} for *V*^∗,

$$
T_{j_{1}\dots j_{q}}^{i_{1}\dots i_{p}}\equiv T\left({\boldsymbol{\varepsilon }}^{i_{1}},\ldots ,{\boldsymbol{\varepsilon }}^{i_{p}},\mathbf{e}_{j_{1}},\ldots ,\mathbf{e}_{j_{q}}\right),
$$

a (*p* + *q*)-dimensional array of components can be obtained. A different choice of basis will yield different components. But, because *T* is linear in all of its arguments, the components satisfy the tensor transformation law used in the multilinear array definition. The multidimensional array of components of *T* thus form a tensor according to that definition. Moreover, such an array can be realized as the components of some multilinear map *T*. This motivates viewing multilinear maps as the intrinsic objects underlying tensors.

In viewing a tensor as a multilinear map, it is conventional to identify the [double dual](https://en.wikipedia.org/wiki/Double_dual "Double dual") *V*^{∗∗} of the vector space *V*, i.e., the space of linear functionals on the dual vector space *V*^∗, with the vector space *V*. There is always a [natural linear map](https://en.wikipedia.org/wiki/Dual_space#Injection_into_the_double-dual "Dual space") from *V* to its double dual, given by evaluating a linear form in *V*^∗ against a vector in *V*. This linear mapping is an isomorphism in finite dimensions, and it is often then expedient to identify *V* with its double dual.


### Using tensor products
Main article: [Tensor (intrinsic definition)](https://en.wikipedia.org/wiki/Tensor_%28intrinsic_definition%29)

For some mathematical applications, a more abstract approach is sometimes useful. This can be achieved by defining tensors in terms of elements of [tensor products](https://en.wikipedia.org/wiki/Tensor_product "Tensor product") of vector spaces, which in turn are defined through a [universal property](https://en.wikipedia.org/wiki/Universal_property "Universal property") as explained [here](https://en.wikipedia.org/wiki/Tensor_product#Universal_property "Tensor product") and [here](https://en.wikipedia.org/wiki/Tensor_%28intrinsic_definition%29#Universal_property "Tensor (intrinsic definition)").

A **type $(p, q)$ tensor** is defined in this context as an element of the tensor product of vector spaces,[\[9\]](#cite_note-10)[\[10\]](#cite_note-11)

$$
T\in \underbrace{V\otimes \dots \otimes V}_{p{\text{ copies}}}\otimes \underbrace{V^{*}\otimes \dots \otimes V^{*}}_{q{\text{ copies}}}.
$$

A basis $v_{i}$ of $V$ and basis $w_{j}$ of $W$ naturally induce a basis $v_{i} ⊗ w_{j}$ of the tensor product $V ⊗ W$. The components of a tensor $T$ are the coefficients of the tensor with respect to the basis obtained from a basis ${e_{i}}$ for $V$ and its dual basis ${ε^{j}}$, i.e.

$$
T=T_{j_{1}\dots j_{q}}^{i_{1}\dots i_{p}}\;\mathbf{e}_{i_{1}}\otimes \cdots \otimes \mathbf{e}_{i_{p}}\otimes{\boldsymbol{\varepsilon }}^{j_{1}}\otimes \cdots \otimes{\boldsymbol{\varepsilon }}^{j_{q}}.
$$

Using the properties of the tensor product, it can be shown that these components satisfy the transformation law for a type $(p, q)$ tensor. Moreover, the universal property of the tensor product gives a [one-to-one correspondence](https://en.wikipedia.org/wiki/Bijection "Bijection") between tensors defined in this way and tensors defined as multilinear maps.

This 1 to 1 correspondence can be achieved in the following way, because in the finite-dimensional case there exists a canonical isomorphism between a vector space and its double dual:

$$
U\otimes V\cong \left(U^{**}\right)\otimes \left(V^{**}\right)\cong \left(U^{*}\otimes V^{*}\right)^{*}\cong \operatorname{Hom}^{2}\left(U^{*}\times V^{*};\mathbb{F} \right)
$$

The last line is using the universal property of the tensor product, that there is a 1 to 1 correspondence between maps from $\operatorname{Hom}^{2}\left(U^{*}\times V^{*};\mathbb{F} \right)$ and $\operatorname{Hom} \left(U^{*}\otimes V^{*};\mathbb{F} \right)$.[\[11\]](#cite_note-12)

Tensor products can be defined in great generality – for example, [involving arbitrary modules](https://en.wikipedia.org/wiki/Tensor_product_of_modules "Tensor product of modules") over a ring. In principle, one could define a "tensor" simply to be an element of any tensor product. However, the mathematics literature usually reserves the term *tensor* for an element of a tensor product of any number of copies of a single vector space $V$ and its dual, as above.


### Tensors in infinite dimensions
This discussion of tensors so far assumes finite dimensionality of the spaces involved, where the spaces of tensors obtained by each of these constructions are [naturally isomorphic](https://en.wikipedia.org/wiki/Naturally_isomorphic "Naturally isomorphic").[\[Note 2\]](#cite_note-13) Constructions of spaces of tensors based on the tensor product and multilinear mappings can be generalized, essentially without modification, to [vector bundles](https://en.wikipedia.org/wiki/Vector_bundle "Vector bundle") or [coherent sheaves](https://en.wikipedia.org/wiki/Coherent_sheaves "Coherent sheaves").[\[12\]](#cite_note-14) For infinite-dimensional vector spaces, inequivalent topologies lead to inequivalent notions of tensor, and these various isomorphisms may or may not hold depending on what exactly is meant by a tensor (see [topological tensor product](https://en.wikipedia.org/wiki/Topological_tensor_product "Topological tensor product")). In some applications, it is the [tensor product of Hilbert spaces](https://en.wikipedia.org/wiki/Tensor_product_of_Hilbert_spaces "Tensor product of Hilbert spaces") that is intended, whose properties are the most similar to the finite-dimensional case. A more modern view is that it is the tensors' structure as a [symmetric monoidal category](https://en.wikipedia.org/wiki/Symmetric_monoidal_category "Symmetric monoidal category") that encodes their most important properties, rather than the specific models of those categories.[\[13\]](#cite_note-15)


### Tensor fields
Main article: [Tensor field](https://en.wikipedia.org/wiki/Tensor_field)

In many applications, especially in differential geometry and physics, it is natural to consider a tensor with components that are functions of the point in a space. This was the setting of Ricci's original work. In modern mathematical terminology such an object is called a [tensor field](https://en.wikipedia.org/wiki/Tensor_field "Tensor field"), often referred to simply as a tensor.[\[1\]](#cite_note-Kline-1)

In this context, a [coordinate basis](https://en.wikipedia.org/wiki/Coordinate_basis "Coordinate basis") is often chosen for the [tangent vector space](https://en.wikipedia.org/wiki/Tangent_space "Tangent space"). The transformation law may then be expressed in terms of [partial derivatives](https://en.wikipedia.org/wiki/Partial_derivative "Partial derivative") of the coordinate functions,

$$
{\bar{x}}^{i}\left(x^{1},\ldots ,x^{n}\right),
$$

defining a coordinate transformation,[\[1\]](#cite_note-Kline-1)

$$
{\hat{T}}_{j'_{1}\dots j'_{q}}^{i'_{1}\dots i'_{p}}\left({\bar{x}}^{1},\ldots ,{\bar{x}}^{n}\right)={\frac{\partial{\bar{x}}^{i'_{1}}}{\partial x^{i_{1}}}}\cdots{\frac{\partial{\bar{x}}^{i'_{p}}}{\partial x^{i_{p}}}}{\frac{\partial x^{j_{1}}}{\partial{\bar{x}}^{j'_{1}}}}\cdots{\frac{\partial x^{j_{q}}}{\partial{\bar{x}}^{j'_{q}}}}T_{j_{1}\dots j_{q}}^{i_{1}\dots i_{p}}\left(x^{1},\ldots ,x^{n}\right).
$$


## History
The concepts of later tensor analysis arose from the work of [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss) in [differential geometry](https://en.wikipedia.org/wiki/Differential_geometry "Differential geometry"), and the formulation was much influenced by the theory of [algebraic forms](https://en.wikipedia.org/wiki/Algebraic_form "Algebraic form") and invariants developed during the middle of the nineteenth century.[\[14\]](#cite_note-16) The word "tensor" itself was introduced in 1846 by [William Rowan Hamilton](https://en.wikipedia.org/wiki/William_Rowan_Hamilton)[\[15\]](#cite_note-17) to describe something different from what is now meant by a tensor.[\[Note 3\]](#cite_note-18) Gibbs introduced [dyadics](https://en.wikipedia.org/wiki/Dyadics "Dyadics") and [polyadic algebra](https://en.wikipedia.org/wiki/Polyadic_algebra "Polyadic algebra"), which are also tensors in the modern sense.[\[16\]](#cite_note-auto-19) The contemporary usage was introduced by [Woldemar Voigt](https://en.wikipedia.org/wiki/Woldemar_Voigt) in 1898.[\[17\]](#cite_note-Voigt1898-20)

Tensor calculus was developed around 1890 by [Gregorio Ricci-Curbastro](https://en.wikipedia.org/wiki/Gregorio_Ricci-Curbastro) under the title *absolute differential calculus*, and originally presented in 1892.[\[18\]](#cite_note-21) It was made accessible to many mathematicians by the publication of Ricci-Curbastro and [Tullio Levi-Civita](https://en.wikipedia.org/wiki/Tullio_Levi-Civita)'s 1900 classic text *Méthodes de calcul différentiel absolu et leurs applications* (Methods of absolute differential calculus and their applications).[\[19\]](#cite_note-FOOTNOTERicciLevi-Civita1900-22) In Ricci's notation, he refers to "systems" with covariant and contravariant components, which are known as tensor fields in the modern sense.[\[16\]](#cite_note-auto-19)

In the 20th century, the subject came to be known as *tensor analysis*, and achieved broader acceptance with the introduction of [Albert Einstein](https://en.wikipedia.org/wiki/Albert_Einstein)'s theory of [general relativity](https://en.wikipedia.org/wiki/General_relativity "General relativity"), around 1915. General relativity is formulated completely in the language of tensors. Einstein had learned about them, with great difficulty, from the geometer [Marcel Grossmann](https://en.wikipedia.org/wiki/Marcel_Grossmann).[\[20\]](#cite_note-23) Levi-Civita then initiated a correspondence with Einstein to correct mistakes Einstein had made in his use of tensor analysis. The correspondence lasted 1915–17, and was characterized by mutual respect:

> I admire the elegance of your method of computation; it must be nice to ride through these fields upon the horse of true mathematics while the like of us have to make our way laboriously on foot.

— Albert Einstein[\[21\]](#cite_note-Goodstein-24)

Tensors and [tensor fields](https://en.wikipedia.org/wiki/Tensor_field "Tensor field") were also found to be useful in other fields such as [continuum mechanics](https://en.wikipedia.org/wiki/Continuum_mechanics "Continuum mechanics"). Some well-known examples of tensors in [differential geometry](https://en.wikipedia.org/wiki/Differential_geometry "Differential geometry") are [quadratic forms](https://en.wikipedia.org/wiki/Quadratic_form "Quadratic form") such as [metric tensors](https://en.wikipedia.org/wiki/Metric_tensor "Metric tensor"), and the [Riemann curvature tensor](https://en.wikipedia.org/wiki/Riemann_curvature_tensor). The [exterior algebra](https://en.wikipedia.org/wiki/Exterior_algebra "Exterior algebra") of [Hermann Grassmann](https://en.wikipedia.org/wiki/Hermann_Grassmann), from the middle of the nineteenth century, is itself a tensor theory, and highly geometric, but it was some time before it was seen, with the theory of [differential forms](https://en.wikipedia.org/wiki/Differential_form "Differential form"), as naturally unified with tensor calculus. The work of [Élie Cartan](https://en.wikipedia.org/wiki/Élie_Cartan) made differential forms one of the basic kinds of tensors used in mathematics, and [Hassler Whitney](https://en.wikipedia.org/wiki/Hassler_Whitney) popularized the [tensor product](https://en.wikipedia.org/wiki/Tensor_product "Tensor product").[\[16\]](#cite_note-auto-19)

From about the 1920s onwards, it was realised that tensors play a basic role in [algebraic topology](https://en.wikipedia.org/wiki/Algebraic_topology "Algebraic topology") (for example in the [Künneth theorem](https://en.wikipedia.org/wiki/Künneth_theorem)).[\[22\]](#cite_note-Spanier2012-25) Correspondingly there are types of tensors at work in many branches of [abstract algebra](https://en.wikipedia.org/wiki/Abstract_algebra "Abstract algebra"), particularly in [homological algebra](https://en.wikipedia.org/wiki/Homological_algebra "Homological algebra") and [representation theory](https://en.wikipedia.org/wiki/Representation_theory "Representation theory"). Multilinear algebra can be developed in greater generality than for scalars coming from a [field](https://en.wikipedia.org/wiki/Field_%28mathematics%29 "Field (mathematics)"). For example, scalars can come from a [ring](https://en.wikipedia.org/wiki/Ring_%28mathematics%29 "Ring (mathematics)"). But the theory is then less geometric and computations more technical and less algorithmic.[\[23\]](#cite_note-Hungerford2003-26) Tensors are generalized within [category theory](https://en.wikipedia.org/wiki/Category_theory "Category theory") by means of the concept of [monoidal category](https://en.wikipedia.org/wiki/Monoidal_category "Monoidal category"), from the 1960s.[\[24\]](#cite_note-MacLane2013-27)


## Examples
See also: [Dyadic tensor](https://en.wikipedia.org/wiki/Dyadic_tensor)

An elementary example of a mapping describable as a tensor is the [dot product](https://en.wikipedia.org/wiki/Dot_product "Dot product"), which maps two vectors to a scalar. A more complex example is the [Cauchy stress tensor](https://en.wikipedia.org/wiki/Cauchy_stress_tensor) **T**, which takes a directional unit vector **v** as input and maps it to the stress vector **T**^{(**v**)}, which is the force (per unit area) exerted by material on the negative side of the plane orthogonal to **v** against the material on the positive side of the plane, thus expressing a relationship between these two vectors, shown in the figure (right). The [cross product](https://en.wikipedia.org/wiki/Cross_product "Cross product"), where two vectors are mapped to a third one, is strictly speaking not a tensor because it changes its sign under those transformations that change the orientation of the coordinate system. The [totally anti-symmetric symbol](https://en.wikipedia.org/wiki/Levi-Civita_symbol "Levi-Civita symbol") $\varepsilon_{ijk}$ nevertheless allows a convenient handling of the cross product in equally oriented three dimensional coordinate systems.

This table shows important examples of tensors on vector spaces and tensor fields on manifolds. The tensors are classified according to their type $(n, m)$, where *n* is the number of contravariant indices, *m* is the number of covariant indices, and $n + m$ gives the total order of the tensor. For example, a [bilinear form](https://en.wikipedia.org/wiki/Bilinear_form "Bilinear form") is the same thing as a $(0, 2)$-tensor; an [inner product](https://en.wikipedia.org/wiki/Inner_product "Inner product") is an example of a $(0, 2)$-tensor, but not all $(0, 2)$-tensors are inner products. In the $(0, M)$-entry of the table, *M* denotes the dimensionality of the underlying vector space or manifold because for each dimension of the space, a separate index is needed to select that dimension to get a maximally covariant antisymmetric tensor.

| *m* *n* | 0 | 1 | 2 | 3 | ⋯ | *M* | ⋯ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | [scalar][1], e.g. [scalar curvature][2] | [covector][3], [linear functional][4], [1-form][5], e.g. [dipole moment][6], [gradient][7] of a scalar field | [bilinear form][8], e.g. [inner product][9], [quadrupole moment][10], [metric tensor][11], [Ricci curvature][12], [2-form][13], [symplectic form][14] | 3-form e.g. [octupole moment][15] | | e.g. *M*-form i.e. [volume form][16] | |
| 1 | [vector][17] | [linear transformation][18],[\[25\]][19] [Kronecker delta][20] | e.g. [cross product][21] in three dimensions | e.g. [Riemann curvature tensor][22] | | | |
| 2 | [bivector][23], e.g. [Poisson structure][24], inverse [metric tensor][11] | | e.g. [elasticity tensor][25] | | | | |
| ⋮ | | | | | | | |
| *N* | [multivector][26] | | | | | | |
| ⋮ | | | | | | | |

[1]: https://en.wikipedia.org/wiki/Scalar_%28mathematics%29
[2]: https://en.wikipedia.org/wiki/Scalar_curvature
[3]: https://en.wikipedia.org/wiki/Covector
[4]: https://en.wikipedia.org/wiki/Linear_functional
[5]: https://en.wikipedia.org/wiki/1-form
[6]: https://en.wikipedia.org/wiki/Multipole_expansion
[7]: https://en.wikipedia.org/wiki/Gradient
[8]: https://en.wikipedia.org/wiki/Bilinear_form
[9]: https://en.wikipedia.org/wiki/Inner_product
[10]: https://en.wikipedia.org/wiki/Quadrupole_moment
[11]: https://en.wikipedia.org/wiki/Metric_tensor
[12]: https://en.wikipedia.org/wiki/Ricci_curvature
[13]: https://en.wikipedia.org/wiki/2-form
[14]: https://en.wikipedia.org/wiki/Symplectic_form
[15]: https://en.wikipedia.org/wiki/Multipole_moment
[16]: https://en.wikipedia.org/wiki/Volume_form
[17]: https://en.wikipedia.org/wiki/Vector
[18]: https://en.wikipedia.org/wiki/Linear_transformation
[19]: #cite_note-BambergSternberg1991-28
[20]: https://en.wikipedia.org/wiki/Kronecker_delta
[21]: https://en.wikipedia.org/wiki/Cross_product
[22]: https://en.wikipedia.org/wiki/Riemann_curvature_tensor
[23]: https://en.wikipedia.org/wiki/Bivector
[24]: https://en.wikipedia.org/wiki/Poisson_structure
[25]: https://en.wikipedia.org/wiki/Elasticity_tensor
[26]: https://en.wikipedia.org/wiki/Multivector

Raising an index on an $(n, m)$-tensor produces an $(n + 1, m − 1)$-tensor; this corresponds to moving diagonally down and to the left on the table. Symmetrically, lowering an index corresponds to moving diagonally up and to the right on the table. [Contraction](#Contraction) of an upper with a lower index of an $(n, m)$-tensor produces an $(n − 1, m − 1)$-tensor; this corresponds to moving diagonally up and to the left on the table.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/N_vector_positive.svg/250px-N_vector_positive.svg.png)](https://en.wikipedia.org/wiki/File:N_vector_positive.svg)

Orientation defined by an ordered set of vectors.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/N_vector_negative.svg/250px-N_vector_negative.svg.png)](https://en.wikipedia.org/wiki/File:N_vector_negative.svg)

Reversed orientation corresponds to negating the exterior product.

Geometric interpretation of grade *n* elements in a real [exterior algebra](https://en.wikipedia.org/wiki/Exterior_algebra "Exterior algebra") for $n = 0$ (signed point), 1 (directed line segment, or vector), 2 (oriented plane element), 3 (oriented volume). The exterior product of *n* vectors can be visualized as any *n*-dimensional shape (e.g. *n*-[parallelotope](https://en.wikipedia.org/wiki/Parallelepiped#Parallelotope "Parallelepiped"), *n*-[ellipsoid](https://en.wikipedia.org/wiki/Ellipsoid "Ellipsoid")); with magnitude ([hypervolume](https://en.wikipedia.org/wiki/Hypervolume "Hypervolume")), and [orientation](https://en.wikipedia.org/wiki/Orientation_%28vector_space%29 "Orientation (vector space)") defined by that on its $n − 1$-dimensional boundary and on which side the interior is.[\[26\]](#cite_note-29)[\[27\]](#cite_note-30)


## Properties
Assuming a [basis](https://en.wikipedia.org/wiki/Basis_of_a_vector_space "Basis of a vector space") of a real vector space, e.g., a coordinate frame in the ambient space, a tensor can be represented as an organized [multidimensional array](https://en.wikipedia.org/wiki/Array_data_structure#Multidimensional_arrays "Array data structure") of numerical values with respect to this specific basis. Changing the basis transforms the values in the array in a characteristic way that allows to *define* tensors as objects adhering to this transformational behavior. For example, there are invariants of tensors that must be preserved under any change of the basis, thereby making only certain multidimensional arrays of numbers a [tensor.](#Holors) Compare this to the array representing $\varepsilon_{ijk}$ not being a tensor, for the sign change under transformations changing the orientation.

Because the components of vectors and their duals transform differently under the change of their dual bases, there is a [covariant and/or contravariant transformation law](https://en.wikipedia.org/wiki/Covariant_transformation "Covariant transformation") that relates the arrays, which represent the tensor with respect to one basis and that with respect to the other one. The numbers of, respectively, vectors: $n$ ([contravariant](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors "Covariance and contravariance of vectors") indices) and dual vectors: $m$ ([covariant](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors "Covariance and contravariance of vectors") indices) in the input and output of a tensor determine the *type* (or *valence*) of the tensor, a pair of natural numbers $(n, m)$, which determine the precise form of the transformation law. The *order* of a tensor is the sum of these two numbers.

The order (also *degree* or *rank*) of a tensor is thus the sum of the orders of its arguments plus the order of the resulting tensor. This is also the dimensionality of the array of numbers needed to represent the tensor with respect to a specific basis, or equivalently, the number of indices needed to label each component in that array. For example, in a fixed basis, a standard linear map that maps a vector to a vector, is represented by a matrix (a 2-dimensional array), and therefore is a 2nd-order tensor. A simple vector can be represented as a 1-dimensional array, and is therefore a 1st-order tensor. Scalars are simple numbers and are thus 0th-order tensors. This way the tensor representing the scalar product, taking two vectors and resulting in a scalar has order $2 + 0 = 2$, the same as the stress tensor, taking one vector and returning another $1 + 1 = 2$. The $\varepsilon_{ijk}$-symbol, mapping two vectors to one vector, would have order $2 + 1 = 3.$

The collection of tensors on a vector space and its dual forms a [tensor algebra](https://en.wikipedia.org/wiki/Tensor_algebra "Tensor algebra"), which allows products of arbitrary tensors. Simple applications of tensors of order $2$, which can be represented as a square matrix, can be solved by clever arrangement of transposed vectors and by applying the rules of matrix multiplication, but the tensor product should not be confused with this.


## Notation
There are several notational systems that are used to describe tensors and perform calculations involving them.


### Ricci calculus
[Ricci calculus](https://en.wikipedia.org/wiki/Ricci_calculus) is the modern formalism and notation for tensor indices: indicating [inner](https://en.wikipedia.org/wiki/Inner_product "Inner product") and [outer products](https://en.wikipedia.org/wiki/Outer_product "Outer product"), [covariance and contravariance](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors "Covariance and contravariance of vectors"), [summations](https://en.wikipedia.org/wiki/Summation "Summation") of tensor components, [symmetry](https://en.wikipedia.org/wiki/Symmetric_tensor "Symmetric tensor") and [antisymmetry](https://en.wikipedia.org/wiki/Antisymmetric_tensor "Antisymmetric tensor"), and [partial](https://en.wikipedia.org/wiki/Partial_derivative "Partial derivative") and [covariant derivatives](https://en.wikipedia.org/wiki/Covariant_derivative "Covariant derivative").


### Einstein summation convention
The [Einstein summation convention](https://en.wikipedia.org/wiki/Einstein_summation_convention) dispenses with writing [summation signs](https://en.wikipedia.org/wiki/Summation_sign "Summation sign"), leaving the summation implicit. Any repeated index symbol is summed over: if the index $i$ is used twice in a given term of a tensor expression, it means that the term is to be summed for all $i$. Several distinct pairs of indices may be summed this way.


### Penrose graphical notation
[Penrose graphical notation](https://en.wikipedia.org/wiki/Penrose_graphical_notation) is a diagrammatic notation which replaces the symbols for tensors with shapes, and their indices by lines and curves. It is independent of basis elements, and requires no symbols for the indices.


### Abstract index notation
The [abstract index notation](https://en.wikipedia.org/wiki/Abstract_index_notation "Abstract index notation") is a way to write tensors such that the indices are no longer thought of as numerical, but rather are [indeterminates](https://en.wikipedia.org/wiki/Indeterminate_%28variable%29 "Indeterminate (variable)"). This notation captures the expressiveness of indices and the basis-independence of index-free notation.


### Component-free notation
A [component-free treatment of tensors](https://en.wikipedia.org/wiki/Component-free_treatment_of_tensors "Component-free treatment of tensors") uses notation that emphasises that tensors do not rely on any basis, and is defined in terms of the [tensor product of vector spaces](https://en.wikipedia.org/wiki/Tensor_product "Tensor product").


## Operations
There are several operations on tensors that again produce a tensor. The linear nature of tensors implies that two tensors of the same type may be added together, and that tensors may be multiplied by a scalar with results analogous to the [scaling of a vector](https://en.wikipedia.org/wiki/Scalar_multiplication "Scalar multiplication"). On components, these operations are simply performed component-wise. These operations do not change the type of the tensor; but there are also operations that produce a tensor of different type.


### Tensor product
Main article: [Tensor product](https://en.wikipedia.org/wiki/Tensor_product)

The [tensor product](https://en.wikipedia.org/wiki/Tensor_product "Tensor product") takes two tensors, *S* and *T*, and produces a new tensor, $S ⊗ T$, whose order is the sum of the orders of the original tensors. When described as multilinear maps, the tensor product simply multiplies the two tensors, i.e., $(S\otimes T)(v_{1},\ldots ,v_{n},v_{n+1},\ldots ,v_{n+m})=S(v_{1},\ldots ,v_{n})T(v_{n+1},\ldots ,v_{n+m}),$ which again produces a map that is linear in all its arguments. On components, the effect is to multiply the components of the two input tensors pairwise, i.e., $(S\otimes T)_{j_{1}\ldots j_{k}j_{k+1}\ldots j_{k+m}}^{i_{1}\ldots i_{l}i_{l+1}\ldots i_{l+n}}=S_{j_{1}\ldots j_{k}}^{i_{1}\ldots i_{l}}T_{j_{k+1}\ldots j_{k+m}}^{i_{l+1}\ldots i_{l+n}}.$ If $S$ is of type $(l, k)$ and $T$ is of type $(n, m)$, then the tensor product $S ⊗ T$ has type $(l + n, k + m)$.


### Contraction
Main article: [Tensor contraction](https://en.wikipedia.org/wiki/Tensor_contraction)

[Tensor contraction](https://en.wikipedia.org/wiki/Tensor_contraction) is an operation that reduces a type (*n*, *m*) tensor to a type (*n* − 1, *m* − 1) tensor, of which the [trace](https://en.wikipedia.org/wiki/Trace_%28linear_algebra%29 "Trace (linear algebra)") is a special case. It thereby reduces the total order of a tensor by two. The operation is achieved by summing components for which one specified contravariant index is the same as one specified covariant index to produce a new component. Components for which those two indices are different are discarded. For example, a (1, 1)-tensor $T_{i}^{j}$ can be contracted to a scalar through $T_{i}^{i}$, where the summation is again implied. When the (1, 1)-tensor is interpreted as a linear map, this operation is known as the [trace](https://en.wikipedia.org/wiki/Trace_%28linear_algebra%29 "Trace (linear algebra)").

The contraction is often used in conjunction with the tensor product to contract an index from each tensor.

The contraction can also be understood using the definition of a tensor as an element of a tensor product of copies of the space *V* with the space *V*^∗ by first decomposing the tensor into a linear combination of simple tensors, and then applying a factor from *V*^∗ to a factor from *V*. For example, a tensor $T\in V\otimes V\otimes V^{*}$ can be written as a linear combination

$$
T=v_{1}\otimes w_{1}\otimes \alpha_{1}+v_{2}\otimes w_{2}\otimes \alpha_{2}+\cdots +v_{N}\otimes w_{N}\otimes \alpha_{N}.
$$

The contraction of *T* on the first and last slots is then the vector

$$
\alpha_{1}(v_{1})w_{1}+\alpha_{2}(v_{2})w_{2}+\cdots +\alpha_{N}(v_{N})w_{N}.
$$

In a vector space with an [inner product](https://en.wikipedia.org/wiki/Inner_product "Inner product") (also known as a [metric](https://en.wikipedia.org/wiki/Metric_tensor "Metric tensor")) *g*, the term [contraction](https://en.wikipedia.org/wiki/Tensor_contraction#Metric_contraction "Tensor contraction") is used for removing two contravariant or two covariant indices by forming a trace with the metric tensor or its inverse. For example, a (2, 0)-tensor $T^{ij}$ can be contracted to a scalar through $T^{ij}g_{ij}$ (yet again assuming the summation convention).


### Raising or lowering an index
Main article: [Raising and lowering indices](https://en.wikipedia.org/wiki/Raising_and_lowering_indices)

When a vector space is equipped with a [nondegenerate bilinear form](https://en.wikipedia.org/wiki/Nondegenerate_bilinear_form "Nondegenerate bilinear form") (or *[metric tensor](https://en.wikipedia.org/wiki/Metric_tensor "Metric tensor")* as it is often called in this context), operations can be defined that convert a contravariant (upper) index into a covariant (lower) index and vice versa. A metric tensor is a (symmetric) (0, 2)-tensor; it is thus possible to contract an upper index of a tensor with one of the lower indices of the metric tensor in the product. This produces a new tensor with the same index structure as the previous tensor, but with lower index generally shown in the same position of the contracted upper index. This operation is quite graphically known as *lowering an index*.

Conversely, the inverse operation can be defined, and is called *raising an index*. This is equivalent to a similar contraction on the product with a (2, 0)-tensor. This *inverse metric tensor* has components that are the matrix inverse of those of the metric tensor.


## Applications

### Continuum mechanics
Important examples are provided by [continuum mechanics](https://en.wikipedia.org/wiki/Continuum_mechanics "Continuum mechanics"). The stresses inside a solid body or [fluid](https://en.wikipedia.org/wiki/Fluid "Fluid")[\[28\]](#cite_note-31) are described by a tensor field. The [stress tensor](https://en.wikipedia.org/wiki/Stress_%28mechanics%29 "Stress (mechanics)") and [strain tensor](https://en.wikipedia.org/wiki/Strain_tensor "Strain tensor") are both second-order tensor fields, and are related in a general linear elastic material by a fourth-order [elasticity tensor](https://en.wikipedia.org/wiki/Elasticity_tensor "Elasticity tensor") field. In detail, the tensor quantifying stress in a 3-dimensional solid object has components that can be conveniently represented as a 3 × 3 array. The three faces of a cube-shaped infinitesimal volume segment of the solid are each subject to some given force. The force's vector components are also three in number. Thus, 3 × 3, or 9 components are required to describe the stress at this cube-shaped infinitesimal segment. Within the bounds of this solid is a whole mass of varying stress quantities, each requiring 9 quantities to describe. Thus, a second-order tensor is needed.

If a particular [surface element](https://en.wikipedia.org/wiki/Volume_form "Volume form") inside the material is singled out, the material on one side of the surface will apply a force on the other side. In general, this force will not be orthogonal to the surface, but it will depend on the orientation of the surface in a linear manner. This is described by a tensor of [type (2, 0)](https://en.wikipedia.org/wiki/Type_of_a_tensor "Type of a tensor"), in [linear elasticity](https://en.wikipedia.org/wiki/Linear_elasticity "Linear elasticity"), or more precisely by a tensor field of type (2, 0), since the stresses may vary from point to point.


### Other examples from physics
Common applications include:

- [Electromagnetic tensor](https://en.wikipedia.org/wiki/Electromagnetic_tensor) (or Faraday tensor) in [electromagnetism](https://en.wikipedia.org/wiki/Electromagnetism "Electromagnetism")
- [Finite deformation tensors](https://en.wikipedia.org/wiki/Finite_deformation_tensors) for describing deformations and [strain tensor](https://en.wikipedia.org/wiki/Strain_tensor "Strain tensor") for [strain](https://en.wikipedia.org/wiki/Strain_%28materials_science%29 "Strain (materials science)") in [continuum mechanics](https://en.wikipedia.org/wiki/Continuum_mechanics "Continuum mechanics")
- [Permittivity](https://en.wikipedia.org/wiki/Permittivity) and [electric susceptibility](https://en.wikipedia.org/wiki/Electric_susceptibility "Electric susceptibility") are tensors in [anisotropic](https://en.wikipedia.org/wiki/Anisotropic "Anisotropic") media
- [Four-tensors](https://en.wikipedia.org/wiki/Four-tensors) in [general relativity](https://en.wikipedia.org/wiki/General_relativity "General relativity") (e.g. [stress–energy tensor](https://en.wikipedia.org/wiki/Stress–energy_tensor "Stress–energy tensor")), used to represent [momentum](https://en.wikipedia.org/wiki/Momentum "Momentum") [fluxes](https://en.wikipedia.org/wiki/Flux "Flux")
- Spherical tensor operators are the eigenfunctions of the quantum [angular momentum operator](https://en.wikipedia.org/wiki/Angular_momentum_operator "Angular momentum operator") in [spherical coordinates](https://en.wikipedia.org/wiki/Spherical_coordinates "Spherical coordinates")
- Diffusion tensors, the basis of [diffusion tensor imaging](https://en.wikipedia.org/wiki/Diffusion_tensor_imaging "Diffusion tensor imaging"), represent rates of diffusion in biological environments
- [Quantum mechanics](https://en.wikipedia.org/wiki/Quantum_mechanics) and [quantum computing](https://en.wikipedia.org/wiki/Quantum_computing "Quantum computing") utilize tensor products for combination of quantum states


### Computer vision and optics
The concept of a tensor of order two is often conflated with that of a matrix. Tensors of higher order do however capture ideas important in science and engineering, as has been shown successively in numerous areas as they develop. This happens, for instance, in the field of [computer vision](https://en.wikipedia.org/wiki/Computer_vision "Computer vision"), with the [trifocal tensor](https://en.wikipedia.org/wiki/Trifocal_tensor "Trifocal tensor") generalizing the [fundamental matrix](https://en.wikipedia.org/wiki/Fundamental_matrix_%28computer_vision%29 "Fundamental matrix (computer vision)").

The field of [nonlinear optics](https://en.wikipedia.org/wiki/Nonlinear_optics "Nonlinear optics") studies the changes to material [polarization density](https://en.wikipedia.org/wiki/Polarization_density#Relation_between_P_and_E_in_various_materials "Polarization density") under extreme electric fields. The polarization waves generated are related to the generating [electric fields](https://en.wikipedia.org/wiki/Electric_field "Electric field") through the nonlinear susceptibility tensor. If the polarization **P** is not linearly proportional to the electric field **E**, the medium is termed *nonlinear*. To a good approximation (for sufficiently weak fields, assuming no permanent dipole moments are present), **P** is given by a [Taylor series](https://en.wikipedia.org/wiki/Taylor_series) in **E** whose coefficients are the nonlinear susceptibilities:

$$
{\frac{P_{i}}{\varepsilon_{0}}}=\sum_{j}\chi_{ij}^{(1)}E_{j}+\sum_{jk}\chi_{ijk}^{(2)}E_{j}E_{k}+\sum_{jk\ell }\chi_{ijk\ell }^{(3)}E_{j}E_{k}E_{\ell }+\cdots .\!
$$

Here $\chi^{(1)}$ is the linear susceptibility, $\chi^{(2)}$ gives the [Pockels effect](https://en.wikipedia.org/wiki/Pockels_effect) and [second harmonic generation](https://en.wikipedia.org/wiki/Second_harmonic_generation "Second harmonic generation"), and $\chi^{(3)}$ gives the [Kerr effect](https://en.wikipedia.org/wiki/Kerr_effect). This expansion shows the way higher-order tensors arise naturally in the subject matter.


### Machine learning
Main article: [Tensor (machine learning)](https://en.wikipedia.org/wiki/Tensor_%28machine_learning%29)

The properties of tensors, especially [tensor decomposition](https://en.wikipedia.org/wiki/Tensor_decomposition "Tensor decomposition"), have enabled their use in [machine learning](https://en.wikipedia.org/wiki/Machine_learning "Machine learning") to embed higher dimensional data in [artificial neural networks](https://en.wikipedia.org/wiki/Artificial_neural_networks "Artificial neural networks"). This notion of tensor differs significantly from that in other areas of mathematics and physics, in the sense that a tensor is the same thing as a multidimensional array. Abstractly, a tensor belongs to tensor product of spaces, each of which has a fixed basis, and the dimensions of the factor spaces can be different. Thus, an example of a tensor in this context is a rectangular matrix. Just as a rectangular matrix has two axes, a horizontal and vertical axis to indicate the position of each entry, a more general tensor has as many axes as there are factors in the tensor product to which it belongs, and an entry of the tensor is referred to be a tuple of integers. The various axes have different dimensions in general.


## Generalizations

### Tensor products of vector spaces
The vector spaces of a [tensor product](https://en.wikipedia.org/wiki/Tensor_product "Tensor product") need not be the same, and sometimes the elements of such a more general tensor product are called "tensors". For example, an element of the tensor product space $V ⊗ W$ is a second-order "tensor" in this more general sense,[\[29\]](#cite_note-Maia2011-32) and an order-$d$ tensor may likewise be defined as an element of a tensor product of $d$ different vector spaces.[\[30\]](#cite_note-Hogben2013-33) A type $(n, m)$ tensor, in the sense defined previously, is also a tensor of order $n + m$ in this more general sense. The concept of tensor product [can be extended](https://en.wikipedia.org/wiki/Tensor_product_of_modules "Tensor product of modules") to arbitrary [modules over a ring](https://en.wikipedia.org/wiki/Module_over_a_ring "Module over a ring").


### Tensors in infinite dimensions
The notion of a tensor can be generalized in a variety of ways to [infinite dimensions](https://en.wikipedia.org/wiki/Dimension_%28vector_space%29 "Dimension (vector space)"). One, for instance, is via the [tensor product](https://en.wikipedia.org/wiki/Tensor_product_of_Hilbert_spaces "Tensor product of Hilbert spaces") of [Hilbert spaces](https://en.wikipedia.org/wiki/Hilbert_space "Hilbert space").[\[31\]](#cite_note-34) Another way of generalizing the idea of tensor, common in [nonlinear analysis](https://en.wikipedia.org/wiki/Nonlinear_system "Nonlinear system"), is via the [multilinear maps definition](#As_multilinear_maps) where instead of using finite-dimensional vector spaces and their [algebraic duals](https://en.wikipedia.org/wiki/Algebraic_dual "Algebraic dual"), one uses infinite-dimensional [Banach spaces](https://en.wikipedia.org/wiki/Banach_space "Banach space") and their [continuous dual](https://en.wikipedia.org/wiki/Continuous_dual "Continuous dual").[\[32\]](#cite_note-35) Tensors thus live naturally on [Banach manifolds](https://en.wikipedia.org/wiki/Banach_manifold "Banach manifold")[\[33\]](#cite_note-36) and [Fréchet manifolds](https://en.wikipedia.org/wiki/Fréchet_manifold "Fréchet manifold").


### Tensor densities
Main article: [Tensor density](https://en.wikipedia.org/wiki/Tensor_density)

Suppose that a homogeneous medium fills $R^{3}$, so that the density of the medium is described by a single [scalar](https://en.wikipedia.org/wiki/Scalar_%28physics%29 "Scalar (physics)") value $ρ$ in $kg⋅m^{−3}$. The mass, in kg, of a region $Ω$ is obtained by multiplying $ρ$ by the volume of the region $Ω$, or equivalently integrating the constant $ρ$ over the region:

$$
m=\int_{\Omega }\rho \,dx\,dy\,dz,
$$

where the Cartesian coordinates $x$, $y$, $z$ are measured in $m$. If the units of length are changed into $cm$, then the numerical values of the coordinate functions must be rescaled by a factor of 100:

$$
x'=100x,\quad y'=100y,\quad z'=100z.
$$

The numerical value of the density $ρ$ must then also transform by $100^{−3} m^{3}/cm^{3}$ to compensate, so that the numerical value of the mass in kg is still given by integral of $\rho \,dx\,dy\,dz$. Thus $\rho '=100^{-3}\rho$ (in units of $kg⋅cm^{−3}$).

More generally, if the Cartesian coordinates $x$, $y$, $z$ undergo a linear transformation, then the numerical value of the density $ρ$ must change by a factor of the reciprocal of the absolute value of the [determinant](https://en.wikipedia.org/wiki/Determinant "Determinant") of the coordinate transformation, so that the integral remains invariant, by the [change of variables formula](https://en.wikipedia.org/wiki/Change_of_variables_formula "Change of variables formula") for integration. Such a quantity that scales by the reciprocal of the absolute value of the determinant of the coordinate transition map is called a [scalar density](https://en.wikipedia.org/wiki/Scalar_density "Scalar density"). To model a non-constant density, $ρ$ is a function of the variables $x$, $y$, $z$ (a [scalar field](https://en.wikipedia.org/wiki/Scalar_field "Scalar field")), and under a [curvilinear](https://en.wikipedia.org/wiki/Curvilinear_coordinates "Curvilinear coordinates") change of coordinates, it transforms by the reciprocal of the [Jacobian](https://en.wikipedia.org/wiki/Jacobian_matrix_and_determinant "Jacobian matrix and determinant") of the coordinate change. For more on the intrinsic meaning, see *[Density on a manifold](https://en.wikipedia.org/wiki/Density_on_a_manifold)*.

A tensor density transforms like a tensor under a coordinate change, except that it in addition picks up a factor of the absolute value of the determinant of the coordinate transition:[\[34\]](#cite_note-37)

$$
T_{j'_{1}\dots j'_{q}}^{i'_{1}\dots i'_{p}}[\mathbf{f} \cdot R]=\left|\det R\right|^{-w}\left(R^{-1}\right)_{i_{1}}^{i'_{1}}\cdots \left(R^{-1}\right)_{i_{p}}^{i'_{p}}T_{j_{1},\ldots ,j_{q}}^{i_{1},\ldots ,i_{p}}[\mathbf{f} ]R_{j'_{1}}^{j_{1}}\cdots R_{j'_{q}}^{j_{q}}.
$$

Here $w$ is called the weight. In general, any tensor multiplied by a power of this function or its absolute value is called a tensor density, or a weighted tensor.[\[35\]](#cite_note-38)[\[36\]](#cite_note-FOOTNOTEKay198827-39) An example of a tensor density is the [current density](https://en.wikipedia.org/wiki/Current_density "Current density") of [electromagnetism](https://en.wikipedia.org/wiki/Electromagnetism "Electromagnetism").

Under an affine transformation of the coordinates, a tensor transforms by the linear part of the transformation itself (or its inverse) on each index. These come from the [rational representations](https://en.wikipedia.org/wiki/Rational_representation "Rational representation") of the general linear group. But this is not quite the most general linear transformation law that such an object may have: tensor densities are non-rational, but are still [semisimple](https://en.wikipedia.org/wiki/Semisimple "Semisimple") representations. A further class of transformations come from the logarithmic representation of the general linear group, a reducible but not semisimple representation,[\[37\]](#cite_note-40) consisting of an $(x, y) ∈ R^{2}$ with the transformation law

$$
(x,y)\mapsto (x+y\log \left|\det R\right|,y).
$$


### Geometric objects
The transformation law for a tensor behaves as a [functor](https://en.wikipedia.org/wiki/Functor "Functor") on the category of admissible coordinate systems, under general linear transformations (or, other transformations within some class, such as [local diffeomorphisms](https://en.wikipedia.org/wiki/Local_diffeomorphism "Local diffeomorphism")). This makes a tensor a special case of a geometrical object, in the technical sense that it is a function of the coordinate system transforming functorially under coordinate changes.[\[38\]](#cite_note-41) Examples of objects obeying more general kinds of transformation laws are [jets](https://en.wikipedia.org/wiki/Jet_%28mathematics%29 "Jet (mathematics)") and, more generally still, [natural bundles](https://en.wikipedia.org/wiki/Natural_bundle "Natural bundle").[\[39\]](#cite_note-42)[\[40\]](#cite_note-43)


### Spinors
Main article: [Spinor](https://en.wikipedia.org/wiki/Spinor)

When changing from one [orthonormal basis](https://en.wikipedia.org/wiki/Orthonormal_basis "Orthonormal basis") (called a *frame*) to another by a rotation, the components of a tensor transform by that same rotation. This transformation does not depend on the path taken through the space of frames. However, the space of frames is not [simply connected](https://en.wikipedia.org/wiki/Simply_connected "Simply connected") (see [orientation entanglement](https://en.wikipedia.org/wiki/Orientation_entanglement "Orientation entanglement") and [plate trick](https://en.wikipedia.org/wiki/Plate_trick "Plate trick")): there are continuous paths in the space of frames with the same beginning and ending configurations that are not deformable one into the other. It is possible to attach an additional discrete invariant to each frame that incorporates this path dependence, and which turns out (locally) to have values of ±1.[\[41\]](#cite_note-44) A [spinor](https://en.wikipedia.org/wiki/Spinor "Spinor") is an object that transforms like a tensor under rotations in the frame, apart from a possible sign that is determined by the value of this discrete invariant.[\[42\]](#cite_note-45)[\[43\]](#cite_note-46)

Spinors are elements of the [spin representation](https://en.wikipedia.org/wiki/Spin_representation "Spin representation") of the rotation group, while tensors are elements of its [tensor representations](https://en.wikipedia.org/wiki/Tensor_representation "Tensor representation"). Other [classical groups](https://en.wikipedia.org/wiki/Classical_group "Classical group") have tensor representations, and so also tensors that are compatible with the group, but all non-compact classical groups have infinite-dimensional unitary representations as well.


## See also
- [![](https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Wiktionary-logo-en-v2.svg/20px-Wiktionary-logo-en-v2.svg.png)](https://en.wikipedia.org/wiki/File:Wiktionary-logo-en-v2.svg) The dictionary definition of [*tensor*](https://en.wiktionary.org/wiki/tensor "wiktionary:tensor") at Wiktionary
- [Array data type](https://en.wikipedia.org/wiki/Array_data_type), for tensor storage and manipulation
- [Bitensor](https://en.wikipedia.org/wiki/Bitensor)


### Foundational
- [Cartesian tensor](https://en.wikipedia.org/wiki/Cartesian_tensor)
- [Fibre bundle](https://en.wikipedia.org/wiki/Fibre_bundle)
- [Glossary of tensor theory](https://en.wikipedia.org/wiki/Glossary_of_tensor_theory)
- [Multilinear projection](https://en.wikipedia.org/wiki/Multilinear_subspace_learning#Multilinear_projection "Multilinear subspace learning")
- [One-form](https://en.wikipedia.org/wiki/One-form)
- [Tensor product of modules](https://en.wikipedia.org/wiki/Tensor_product_of_modules)


### Applications
- [Application of tensor theory in engineering](https://en.wikipedia.org/wiki/Application_of_tensor_theory_in_engineering)
- [Continuum mechanics](https://en.wikipedia.org/wiki/Continuum_mechanics)
- [Covariant derivative](https://en.wikipedia.org/wiki/Covariant_derivative)
- [Curvature](https://en.wikipedia.org/wiki/Curvature)
- [Diffusion tensor MRI](https://en.wikipedia.org/wiki/Diffusion_MRI#Mathematical_foundation—tensors "Diffusion MRI")
- [Einstein field equations](https://en.wikipedia.org/wiki/Einstein_field_equations)
- [Fluid mechanics](https://en.wikipedia.org/wiki/Fluid_mechanics)
- [Gravity](https://en.wikipedia.org/wiki/Gravity)
- [Multilinear subspace learning](https://en.wikipedia.org/wiki/Multilinear_subspace_learning)
- [Riemannian geometry](https://en.wikipedia.org/wiki/Riemannian_geometry)
- [Structure tensor](https://en.wikipedia.org/wiki/Structure_tensor)
- [Tensor Contraction Engine](https://en.wikipedia.org/wiki/Tensor_Contraction_Engine)
- [Tensor decomposition](https://en.wikipedia.org/wiki/Tensor_decomposition)
- [Tensor derivative](https://en.wikipedia.org/wiki/Tensor_derivative)
- [Tensor software](https://en.wikipedia.org/wiki/Tensor_software)


## Explanatory notes
1. <a id="cite_note-5"></a> The Einstein summation convention, in brief, requires the sum to be taken over all values of the index whenever the same symbol appears as a subscript and superscript in the same term. For example, under this convention $B_{i}C^{i}=B_{1}C^{1}+B_{2}C^{2}+\cdots +B_{n}C^{n}$
2. <a id="cite_note-13"></a> The [double duality isomorphism](https://en.wikipedia.org/wiki/Dual_space#Injection_into_the_double-dual "Dual space"), for instance, is used to identify *V* with the double dual space *V*^{∗∗}, which consists of multilinear forms of degree one on *V*^∗. It is typical in linear algebra to identify spaces that are naturally isomorphic, treating them as the same space.
3. <a id="cite_note-18"></a> Namely, the [norm operation](https://en.wikipedia.org/wiki/Norm_%28mathematics%29 "Norm (mathematics)") in a vector space.


## References

### Specific
1. <a id="cite_note-Kline-1"></a> Kline, Morris (1990). [*Mathematical Thought From Ancient to Modern Times*](https://books.google.com/books?id=-OsRDAAAQBAJ). Vol. 3. Oxford University Press. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-19-506137-6](https://en.wikipedia.org/wiki/Special:BookSources/978-0-19-506137-6 "Special:BookSources/978-0-19-506137-6").
2. <a id="cite_note-DeLathauwerEtAl2000-2"></a> De Lathauwer, Lieven; De Moor, Bart; Vandewalle, Joos (2000). ["A Multilinear Singular Value Decomposition"](https://alterlab.org/teaching/BME6780/papers+patents/De_Lathauwer_2000.pdf) (PDF). *[SIAM J. Matrix Anal. Appl.](https://en.wikipedia.org/wiki/SIAM_J._Matrix_Anal._Appl.)* **21** (4): 1253–1278. [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1137/S0895479896305696](https://doi.org/10.1137/S0895479896305696). [S2CID](https://en.wikipedia.org/wiki/S2CID_%28identifier%29 "S2CID (identifier)") [14344372](https://api.semanticscholar.org/CorpusID:14344372).
3. <a id="cite_note-Vasilescu2002Tensorfaces-3"></a> Vasilescu, M.A.O.; Terzopoulos, D. (2002). ["Multilinear Analysis of Image Ensembles: TensorFaces"](https://web.archive.org/web/20221229090931/http://www.cs.toronto.edu/~maov/tensorfaces/Springer%20ECCV%202002_files/eccv02proceeding_23500447.pdf) (PDF). *Computer Vision — ECCV 2002*. Lecture Notes in Computer Science. Vol. 2350. pp. 447–460. [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1007/3-540-47969-4_30](https://doi.org/10.1007/3-540-47969-4_30). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-3-540-43745-1](https://en.wikipedia.org/wiki/Special:BookSources/978-3-540-43745-1 "Special:BookSources/978-3-540-43745-1"). [S2CID](https://en.wikipedia.org/wiki/S2CID_%28identifier%29 "S2CID (identifier)") [12793247](https://api.semanticscholar.org/CorpusID:12793247). Archived from [the original](http://www.cs.toronto.edu/~maov/tensorfaces/Springer%20ECCV%202002_files/eccv02proceeding_23500447.pdf) (PDF) on 2022-12-29. Retrieved 2022-12-29.
4. <a id="cite_note-KoldaBader2009-4"></a> Kolda, Tamara; Bader, Brett (2009). ["Tensor Decompositions and Applications"](https://www.kolda.net/publication/TensorReview.pdf) (PDF). *[SIAM Review](https://en.wikipedia.org/wiki/SIAM_Review)*. **51** (3): 455–500. [Bibcode](https://en.wikipedia.org/wiki/Bibcode_%28identifier%29 "Bibcode (identifier)"):[2009SIAMR..51..455K](https://ui.adsabs.harvard.edu/abs/2009SIAMR..51..455K). [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1137/07070111X](https://doi.org/10.1137/07070111X). [S2CID](https://en.wikipedia.org/wiki/S2CID_%28identifier%29 "S2CID (identifier)") [16074195](https://api.semanticscholar.org/CorpusID:16074195).
5. <a id="cite_note-Sharpe2000-6"></a> Sharpe, R.W. (2000). [*Differential Geometry: Cartan's Generalization of Klein's Erlangen Program*](https://books.google.com/books?id=Ytqs4xU5QKAC&pg=PA194). Springer. p. 194. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-387-94732-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-387-94732-7 "Special:BookSources/978-0-387-94732-7").
6. <a id="cite_note-7"></a> [Schouten, Jan Arnoldus](https://en.wikipedia.org/wiki/Jan_Arnoldus_Schouten "Jan Arnoldus Schouten") (1954), ["Chapter II"](https://books.google.com/books?id=WROiC9st58gC), [*Tensor analysis for physicists*](https://archive.org/details/isbn_9780486655826), Courier Corporation, [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-486-65582-6](https://en.wikipedia.org/wiki/Special:BookSources/978-0-486-65582-6 "Special:BookSources/978-0-486-65582-6") `{{[citation](https://en.wikipedia.org/wiki/Template:Citation "Template:Citation")}}`: ISBN / Date incompatibility ([help](https://en.wikipedia.org/wiki/Help:CS1_errors#invalid_isbn_date "Help:CS1 errors"))
7. <a id="cite_note-8"></a> Kobayashi, Shoshichi; Nomizu, Katsumi (1996), [*Foundations of Differential Geometry*](https://en.wikipedia.org/wiki/Foundations_of_Differential_Geometry "Foundations of Differential Geometry"), vol. 1 (New ed.), [Wiley Interscience](https://en.wikipedia.org/wiki/Wiley_Interscience), [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-471-15733-5](https://en.wikipedia.org/wiki/Special:BookSources/978-0-471-15733-5 "Special:BookSources/978-0-471-15733-5")
8. <a id="cite_note-9"></a> Lee, John (2000), [*Introduction to smooth manifolds*](https://books.google.com/books?id=4sGuQgAACAAJ&pg=PA173), Springer, p. 173, [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-387-95495-0](https://en.wikipedia.org/wiki/Special:BookSources/978-0-387-95495-0 "Special:BookSources/978-0-387-95495-0")
9. <a id="cite_note-10"></a> Dodson, C.T.J.; Poston, T. (2013) [1991]. *Tensor geometry: The Geometric Viewpoint and Its Uses*. Graduate Texts in Mathematics. Vol. 130 (2nd ed.). Springer. p. 105. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [9783642105142](https://en.wikipedia.org/wiki/Special:BookSources/9783642105142 "Special:BookSources/9783642105142").
10. <a id="cite_note-11"></a> ["Affine tensor"](https://www.encyclopediaofmath.org/index.php?title=Affine_tensor), *[Encyclopedia of Mathematics](https://en.wikipedia.org/wiki/Encyclopedia_of_Mathematics)*, [EMS Press](https://en.wikipedia.org/wiki/European_Mathematical_Society "European Mathematical Society"), 2001 [1994]
11. <a id="cite_note-12"></a> ["Why are Tensors (Vectors of the form a⊗b...⊗z) multilinear maps?"](https://math.stackexchange.com/q/4163471). *Mathematics Stackexchange*. June 5, 2021.
12. <a id="cite_note-14"></a> Bourbaki, N. (1998). ["3"](https://books.google.com/books?id=STS9aZ6F204C). *Algebra I: Chapters 1-3*. Springer. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-3-540-64243-5](https://en.wikipedia.org/wiki/Special:BookSources/978-3-540-64243-5 "Special:BookSources/978-3-540-64243-5"). where the case of finitely generated projective modules is treated. The global sections of sections of a vector bundle over a compact space form a projective module over the ring of smooth functions. All statements for coherent sheaves are true locally.
13. <a id="cite_note-15"></a> Joyal, André; Street, Ross (1993), "Braided tensor categories", *[Advances in Mathematics](https://en.wikipedia.org/wiki/Advances_in_Mathematics)*, **102**: 20–78, [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1006/aima.1993.1055](https://doi.org/10.1006/aima.1993.1055)
14. <a id="cite_note-16"></a> Reich, Karin (1994). [*Die Entwicklung des Tensorkalküls*](https://books.google.com/books?id=O6lixBzbc0gC). Science networks historical studies. Vol. 11. Birkhäuser. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-3-7643-2814-6](https://en.wikipedia.org/wiki/Special:BookSources/978-3-7643-2814-6 "Special:BookSources/978-3-7643-2814-6"). [OCLC](https://en.wikipedia.org/wiki/OCLC_%28identifier%29 "OCLC (identifier)") [31468174](https://search.worldcat.org/oclc/31468174).
15. <a id="cite_note-17"></a> Hamilton, William Rowan (1854–1855). Wilkins, David R. (ed.). ["On some Extensions of Quaternions"](http://www.emis.de/classics/Hamilton/ExtQuat.pdf) (PDF). *[Philosophical Magazine](https://en.wikipedia.org/wiki/Philosophical_Magazine)* (7–9): 492–9, 125–137, 261–9, 46–51, 280–290. [ISSN](https://en.wikipedia.org/wiki/ISSN_%28identifier%29 "ISSN (identifier)") [0302-7597](https://search.worldcat.org/issn/0302-7597). From p. 498: "And if we agree to call the *square root* (taken with a suitable sign) of this scalar product of two conjugate polynomes, P and KP, the common TENSOR of each, ... "
16. <a id="cite_note-auto-19"></a> Guo, Hongyu (2021-06-16). [*What Are Tensors Exactly?*](https://books.google.com/books?id=5dM3EAAAQBAJ&q=array+vector+matrix+tensor). World Scientific. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-981-12-4103-1](https://en.wikipedia.org/wiki/Special:BookSources/978-981-12-4103-1 "Special:BookSources/978-981-12-4103-1").
17. <a id="cite_note-Voigt1898-20"></a> Voigt, Woldemar (1898). [*Die fundamentalen physikalischen Eigenschaften der Krystalle in elementarer Darstellung*](https://books.google.com/books?id=QhBDAAAAIAAJ&pg=PA20) [*The fundamental physical properties of crystals in an elementary presentation*]. Von Veit. pp. 20–.
    > Wir wollen uns deshalb nur darauf stützen, dass Zustände der geschilderten Art bei Spannungen und Dehnungen nicht starrer Körper auftreten, und sie deshalb tensorielle, die für sie charakteristischen physikalischen Grössen aber Tensoren nennen. [We therefore want [our presentation] to be based only on [the assumption that] conditions of the type described occur during stresses and strains of non-rigid bodies, and therefore call them "tensorial" but call the characteristic physical quantities for them "tensors".]
18. <a id="cite_note-21"></a> Ricci Curbastro, G. (1892). ["Résumé de quelques travaux sur les systèmes variables de fonctions associés à une forme différentielle quadratique"](https://books.google.com/books?id=1bGdAQAACAAJ). *Bulletin des Sciences Mathématiques*. **2** (16): 167–189.
19. <a id="cite_note-FOOTNOTERicciLevi-Civita1900-22"></a> [Ricci & Levi-Civita 1900](#CITEREFRicciLevi-Civita1900).
20. <a id="cite_note-23"></a> Pais, Abraham (2005). [*Subtle Is the Lord: The Science and the Life of Albert Einstein*](https://books.google.com/books?id=U2mO4nUunuwC). Oxford University Press. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-19-280672-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-19-280672-7 "Special:BookSources/978-0-19-280672-7").
21. <a id="cite_note-Goodstein-24"></a> [Goodstein, Judith R.](https://en.wikipedia.org/wiki/Judith_R._Goodstein "Judith R. Goodstein") (1982). "The Italian Mathematicians of Relativity". *Centaurus*. **26** (3): 241–261. [Bibcode](https://en.wikipedia.org/wiki/Bibcode_%28identifier%29 "Bibcode (identifier)"):[1982Cent...26..241G](https://ui.adsabs.harvard.edu/abs/1982Cent...26..241G). [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1111/j.1600-0498.1982.tb00665.x](https://doi.org/10.1111/j.1600-0498.1982.tb00665.x).
22. <a id="cite_note-Spanier2012-25"></a> Spanier, Edwin H. (2012). [*Algebraic Topology*](https://books.google.com/books?id=iKx3BQAAQBAJ&&pg=PA227). Springer. p. 227. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-1-4684-9322-1](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4684-9322-1 "Special:BookSources/978-1-4684-9322-1").
    > the Künneth formula expressing the homology of the tensor product...
23. <a id="cite_note-Hungerford2003-26"></a> [Hungerford, Thomas W.](https://en.wikipedia.org/wiki/Thomas_W._Hungerford "Thomas W. Hungerford") (2003). [*Algebra*](https://books.google.com/books?id=t6N_tOQhafoC&pg=PA168). Springer. p. 168. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-387-90518-1](https://en.wikipedia.org/wiki/Special:BookSources/978-0-387-90518-1 "Special:BookSources/978-0-387-90518-1").
    > ...the classification (up to isomorphism) of modules over an arbitrary ring is quite difficult...
24. <a id="cite_note-MacLane2013-27"></a> [MacLane, Saunders](https://en.wikipedia.org/wiki/Saunders_Mac_Lane "Saunders Mac Lane") (2013). [*Categories for the Working Mathematician*](https://books.google.com/books?id=6KPSBwAAQBAJ&pg=PA4). Springer. p. 4. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-1-4612-9839-7](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4612-9839-7 "Special:BookSources/978-1-4612-9839-7").
    > ...for example the monoid M ... in the category of abelian groups, × is replaced by the usual tensor product...
25. <a id="cite_note-BambergSternberg1991-28"></a> Bamberg, Paul; Sternberg, Shlomo (1991). *A Course in Mathematics for Students of Physics*. Vol. 2. Cambridge University Press. p. 669. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-521-40650-5](https://en.wikipedia.org/wiki/Special:BookSources/978-0-521-40650-5 "Special:BookSources/978-0-521-40650-5").
26. <a id="cite_note-29"></a> Penrose, R. (2007). [*The Road to Reality*](https://en.wikipedia.org/wiki/The_Road_to_Reality "The Road to Reality"). Vintage. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-679-77631-4](https://en.wikipedia.org/wiki/Special:BookSources/978-0-679-77631-4 "Special:BookSources/978-0-679-77631-4").
27. <a id="cite_note-30"></a> Wheeler, J.A.; Misner, C.; Thorne, K.S. (1973). [*Gravitation*](https://books.google.com/books?id=w4Gigq3tY1kC). W.H. Freeman. p. 83. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-7167-0344-0](https://en.wikipedia.org/wiki/Special:BookSources/978-0-7167-0344-0 "Special:BookSources/978-0-7167-0344-0").
28. <a id="cite_note-31"></a> Schobeiri, Meinhard T. (2021). "Vector and Tensor Analysis, Applications to Fluid Mechanics". *Fluid Mechanics for Engineers*. Springer. pp. 11–29.
29. <a id="cite_note-Maia2011-32"></a> Maia, M. D. (2011). [*Geometry of the Fundamental Interactions: On Riemann's Legacy to High Energy Physics and Cosmology*](https://books.google.com/books?id=wEWw_vGBDW8C&pg=PA48). Springer. p. 48. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-1-4419-8273-5](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4419-8273-5 "Special:BookSources/978-1-4419-8273-5").
30. <a id="cite_note-Hogben2013-33"></a> [Hogben, Leslie](https://en.wikipedia.org/wiki/Leslie_Hogben "Leslie Hogben"), ed. (2013). [*Handbook of Linear Algebra*](https://books.google.com/books?id=Er7MBQAAQBAJ&pg=PA7) (2nd ed.). CRC Press. pp. 15–7. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-1-4665-0729-6](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4665-0729-6 "Special:BookSources/978-1-4665-0729-6").
31. <a id="cite_note-34"></a> Segal, I. E. (January 1956). ["Tensor Algebras Over Hilbert Spaces. I"](https://doi.org/10.2307/1992855). *[Transactions of the American Mathematical Society](https://en.wikipedia.org/wiki/Transactions_of_the_American_Mathematical_Society)*. **81** (1): 106–134. [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.2307/1992855](https://doi.org/10.2307/1992855). [JSTOR](https://en.wikipedia.org/wiki/JSTOR_%28identifier%29 "JSTOR (identifier)") [1992855](https://www.jstor.org/stable/1992855).
32. <a id="cite_note-35"></a> Abraham, Ralph; Marsden, Jerrold E.; Ratiu, Tudor S. (February 1988). ["5. Tensors"](https://books.google.com/books?id=dWHet_zgyCAC). *Manifolds, Tensor Analysis and Applications*. Applied Mathematical Sciences. Vol. 75 (2nd ed.). Springer. pp. 338–9. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-387-96790-5](https://en.wikipedia.org/wiki/Special:BookSources/978-0-387-96790-5 "Special:BookSources/978-0-387-96790-5"). [OCLC](https://en.wikipedia.org/wiki/OCLC_%28identifier%29 "OCLC (identifier)") [18562688](https://search.worldcat.org/oclc/18562688).
    > Elements of T^r_s are called tensors on E, [...].
33. <a id="cite_note-36"></a> [Lang, Serge](https://en.wikipedia.org/wiki/Serge_Lang "Serge Lang") (1972). [*Differential manifolds*](https://books.google.com/books?id=dn7rBwAAQBAJ). [Addison-Wesley](https://en.wikipedia.org/wiki/Addison-Wesley). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-201-04166-8](https://en.wikipedia.org/wiki/Special:BookSources/978-0-201-04166-8 "Special:BookSources/978-0-201-04166-8").
34. <a id="cite_note-37"></a> [Schouten, Jan Arnoldus](https://en.wikipedia.org/wiki/Jan_Arnoldus_Schouten "Jan Arnoldus Schouten"), ["§II.8: Densities"](https://books.google.com/books?id=WROiC9st58gC), *Tensor analysis for physicists*
35. <a id="cite_note-38"></a> McConnell, A.J. (2014) [1957]. [*Applications of tensor analysis*](https://books.google.com/books?id=ZCP0AwAAQBAJ). Dover. p. 28. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [9780486145020](https://en.wikipedia.org/wiki/Special:BookSources/9780486145020 "Special:BookSources/9780486145020").
36. <a id="cite_note-FOOTNOTEKay198827-39"></a> [Kay 1988](#CITEREFKay1988), p. 27.
37. <a id="cite_note-40"></a> Olver, Peter (1995), [*Equivalence, invariants, and symmetry*](https://books.google.com/books?id=YuTzf61HILAC&pg=PA77), Cambridge University Press, p. 77, [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [9780521478113](https://en.wikipedia.org/wiki/Special:BookSources/9780521478113 "Special:BookSources/9780521478113")
38. <a id="cite_note-41"></a> Haantjes, J.; [Laman, G.](https://en.wikipedia.org/wiki/Gerard_Laman "Gerard Laman") (1953). "On the definition of geometric objects. I". *Proceedings of the Koninklijke Nederlandse Akademie van Wetenschappen: Series A: Mathematical Sciences*. **56** (3): 208–215.
39. <a id="cite_note-42"></a> [Nijenhuis, Albert](https://en.wikipedia.org/wiki/Albert_Nijenhuis "Albert Nijenhuis") (1960), ["Geometric aspects of formal differential operations on tensor fields"](https://web.archive.org/web/20171027025011/http://www.mathunion.org/ICM/ICM1958/Main/icm1958.0463.0469.ocr.pdf) (PDF), *Proc. Internat. Congress Math.(Edinburgh, 1958)*, Cambridge University Press, pp. 463–9, archived from [the original](http://www.mathunion.org/ICM/ICM1958/Main/icm1958.0463.0469.ocr.pdf) (PDF) on 2017-10-27, retrieved 2017-10-26.
40. <a id="cite_note-43"></a> Salviori, Sarah (1972), ["On the theory of geometric objects"](https://projecteuclid.org/download/pdf_1/euclid.jdg/1214430830), *[Journal of Differential Geometry](https://en.wikipedia.org/wiki/Journal_of_Differential_Geometry)*, **7** (1–2): 257–278, [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.4310/jdg/1214430830](https://doi.org/10.4310/jdg/1214430830).
41. <a id="cite_note-44"></a> [Penrose, Roger](https://en.wikipedia.org/wiki/Roger_Penrose "Roger Penrose") (2005). [*The road to reality: a complete guide to the laws of our universe*](https://books.google.com/books?id=VWTNCwAAQBAJ&pg=PA203). Knopf. pp. 203–206.
42. <a id="cite_note-45"></a> Meinrenken, E. (2013). "The spin representation". *Clifford Algebras and Lie Theory*. Ergebnisse der Mathematik undihrer Grenzgebiete. 3. Folge / A Series of Modern Surveys in Mathematics. Vol. 58. Springer. pp. 49–85. [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1007/978-3-642-36216-3_3](https://doi.org/10.1007/978-3-642-36216-3_3). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-3-642-36215-6](https://en.wikipedia.org/wiki/Special:BookSources/978-3-642-36215-6 "Special:BookSources/978-3-642-36215-6").
43. <a id="cite_note-46"></a> Dong, S. H. (2011), "2. Special Orthogonal Group SO(*N*)", *Wave Equations in Higher Dimensions*, Springer, pp. 13–38


### General
- [Bishop, Richard L.](https://en.wikipedia.org/wiki/Richard_L._Bishop "Richard L. Bishop"); Samuel I. Goldberg (1980) [1968]. [*Tensor Analysis on Manifolds*](https://books.google.com/books?id=ePFIAwAAQBAJ). Dover. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-486-64039-6](https://en.wikipedia.org/wiki/Special:BookSources/978-0-486-64039-6 "Special:BookSources/978-0-486-64039-6").
- [Danielson, Donald A.](https://en.wikipedia.org/wiki/Donald_A._Danielson "Donald A. Danielson") (2003). *Vectors and Tensors in Engineering and Physics* (2/e ed.). Westview (Perseus). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-8133-4080-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-8133-4080-7 "Special:BookSources/978-0-8133-4080-7").
- Dimitrienko, Yuriy (2002). [*Tensor Analysis and Nonlinear Tensor Functions*](https://books.google.com/books?id=7UMYToTiYDsC). Springer. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-1-4020-1015-6](https://en.wikipedia.org/wiki/Special:BookSources/978-1-4020-1015-6 "Special:BookSources/978-1-4020-1015-6").
- Jeevanjee, Nadir (2011). [*An Introduction to Tensors and Group Theory for Physicists*](https://www.springer.com/new+&+forthcoming+titles+%28default%29/book/978-0-8176-4714-8). Birkhauser. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-8176-4714-8](https://en.wikipedia.org/wiki/Special:BookSources/978-0-8176-4714-8 "Special:BookSources/978-0-8176-4714-8").
- Lawden, D. F. (2003). [*Introduction to Tensor Calculus, Relativity and Cosmology*](https://books.google.com/books?id=rJYoAwAAQBAJ) (3/e ed.). Dover. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-486-42540-5](https://en.wikipedia.org/wiki/Special:BookSources/978-0-486-42540-5 "Special:BookSources/978-0-486-42540-5").
- Lebedev, Leonid P.; Cloud, Michael J. (2003). *Tensor Analysis*. World Scientific. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-981-238-360-0](https://en.wikipedia.org/wiki/Special:BookSources/978-981-238-360-0 "Special:BookSources/978-981-238-360-0").
- Lovelock, David; Rund, Hanno (1989) [1975]. [*Tensors, Differential Forms, and Variational Principles*](https://books.google.com/books?id=Tl3dCgAAQBAJ). Dover. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-486-65840-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-486-65840-7 "Special:BookSources/978-0-486-65840-7").
- Munkres, James R. (1997). [*Analysis On Manifolds*](https://books.google.com/books?id=tGT6K6HdFfwC). Avalon. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-8133-4548-2](https://en.wikipedia.org/wiki/Special:BookSources/978-0-8133-4548-2 "Special:BookSources/978-0-8133-4548-2"). Chapter six gives a "from scratch" introduction to covariant tensors.
- [Ricci, Gregorio](https://en.wikipedia.org/wiki/Gregorio_Ricci-Curbastro "Gregorio Ricci-Curbastro"); Levi-Civita, Tullio (March 1900). ["Méthodes de calcul différentiel absolu et leurs applications"](https://zenodo.org/record/1428270). *[Mathematische Annalen](https://en.wikipedia.org/wiki/Mathematische_Annalen)*. **54** (1–2): 125–201. [doi](https://en.wikipedia.org/wiki/Doi_%28identifier%29 "Doi (identifier)"):[10.1007/BF01454201](https://doi.org/10.1007/BF01454201). [S2CID](https://en.wikipedia.org/wiki/S2CID_%28identifier%29 "S2CID (identifier)") [120009332](https://api.semanticscholar.org/CorpusID:120009332).
- Kay, David C (1988-04-01). [*Schaum's Outline of Tensor Calculus*](https://books.google.com/books?id=6tUU3KruG14C). McGraw-Hill. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-07-033484-7](https://en.wikipedia.org/wiki/Special:BookSources/978-0-07-033484-7 "Special:BookSources/978-0-07-033484-7").
- Schutz, Bernard F. (28 January 1980). [*Geometrical Methods of Mathematical Physics*](https://books.google.com/books?id=HAPMB2e643kC). Cambridge University Press. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-521-29887-2](https://en.wikipedia.org/wiki/Special:BookSources/978-0-521-29887-2 "Special:BookSources/978-0-521-29887-2").
- Synge, John Lighton; Schild, Alfred (1969). [*Tensor Calculus*](https://books.google.com/books?id=8vlGhlxqZjsC). Courier Corporation. [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [978-0-486-63612-2](https://en.wikipedia.org/wiki/Special:BookSources/978-0-486-63612-2 "Special:BookSources/978-0-486-63612-2").

- *This article incorporates material from tensor on [PlanetMath](https://en.wikipedia.org/wiki/PlanetMath), which is licensed under the [Creative Commons Attribution/Share-Alike License](https://en.wikipedia.org/wiki/Wikipedia:CC-BY-SA "Wikipedia:CC-BY-SA").*


## External links
[![](https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/40px-Commons-logo.svg.png)](https://en.wikipedia.org/wiki/File:Commons-logo.svg)

Wikimedia Commons has media related to [Tensors](https://commons.wikimedia.org/wiki/Category:Tensors "commons:Category:Tensors").

- [Weisstein, Eric W.](https://en.wikipedia.org/wiki/Eric_W._Weisstein "Eric W. Weisstein") ["Tensor"](https://mathworld.wolfram.com/Tensor.html). *[MathWorld](https://en.wikipedia.org/wiki/MathWorld)*.
- [Bowen, Ray M.](https://en.wikipedia.org/wiki/Ray_M._Bowen "Ray M. Bowen"); Wang, C.C. (1976). *Linear and Multilinear Algebra*. Introduction to Vectors and Tensors. Vol. 1. Plenum Press. [hdl](https://en.wikipedia.org/wiki/Hdl_%28identifier%29 "Hdl (identifier)"):[1969.1/2502](https://hdl.handle.net/1969.1/2502). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [9780306375088](https://en.wikipedia.org/wiki/Special:BookSources/9780306375088 "Special:BookSources/9780306375088").
- Bowen, Ray M.; Wang, C.C. (2006). *Vector and Tensor Analysis*. Introduction to Vectors and Tensors. Vol. 2. [hdl](https://en.wikipedia.org/wiki/Hdl_%28identifier%29 "Hdl (identifier)"):[1969.1/3609](https://hdl.handle.net/1969.1/3609). [ISBN](https://en.wikipedia.org/wiki/ISBN_%28identifier%29 "ISBN (identifier)") [9780306375095](https://en.wikipedia.org/wiki/Special:BookSources/9780306375095 "Special:BookSources/9780306375095").
- Kolecki, Joseph C. (2002). ["An Introduction to Tensors for Students of Physics and Engineering"](https://ntrs.nasa.gov/citations/20020083040). Cleveland, Ohio: [NASA](https://en.wikipedia.org/wiki/NASA) Glenn Research Center. 20020083040.
- Kolecki, Joseph C. (2005). ["Foundations of Tensor Analysis for Students of Physics and Engineering With an Introduction to the Theory of Relativity"](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20050175884.pdf) (PDF). Cleveland, Ohio: NASA Glenn Research Center. 20050175884.
- [A discussion of the various approaches to teaching tensors, and recommendations of textbooks](https://web.archive.org/web/20051104201543/http://nrich.maths.org/askedNRICH/edited/2604.html)
- Sharipov, Ruslan (2004). "Quick introduction to tensor analysis". [arXiv](https://en.wikipedia.org/wiki/ArXiv_%28identifier%29 "ArXiv (identifier)"):[math.HO/0403252](https://arxiv.org/abs/math.HO/0403252).
- [Feynman, Richard](https://en.wikipedia.org/wiki/Richard_Feynman "Richard Feynman") (1964–2013). ["31. Tensors"](https://feynmanlectures.caltech.edu/II_31.html). *The Feynman Lectures*. California Institute of Technology.

:::navbox  
- **Tensors**
- *[Glossary of tensor theory](https://en.wikipedia.org/wiki/Glossary_of_tensor_theory)*
- Scope
  - [Mathematics](https://en.wikipedia.org/wiki/Mathematics)
    - [Coordinate system](https://en.wikipedia.org/wiki/Coordinate_system)
    - [Differential geometry](https://en.wikipedia.org/wiki/Differential_geometry)
    - [Dyadic algebra](https://en.wikipedia.org/wiki/Dyadics "Dyadics")
    - [Euclidean geometry](https://en.wikipedia.org/wiki/Euclidean_geometry)
    - [Exterior calculus](https://en.wikipedia.org/wiki/Exterior_calculus)
    - [Multilinear algebra](https://en.wikipedia.org/wiki/Multilinear_algebra)
    - [Tensor algebra](https://en.wikipedia.org/wiki/Tensor_algebra)
    - [Tensor calculus](https://en.wikipedia.org/wiki/Tensor_calculus)
  - [Physics](https://en.wikipedia.org/wiki/Physics) • [Engineering](https://en.wikipedia.org/wiki/Engineering)
    - [Computer vision](https://en.wikipedia.org/wiki/Computer_vision)
    - [Continuum mechanics](https://en.wikipedia.org/wiki/Continuum_mechanics)
    - [Electromagnetism](https://en.wikipedia.org/wiki/Electromagnetism)
    - [General relativity](https://en.wikipedia.org/wiki/General_relativity)
    - [Transport phenomena](https://en.wikipedia.org/wiki/Transport_phenomena)
- Notation
  - [Abstract index notation](https://en.wikipedia.org/wiki/Abstract_index_notation)
  - [Einstein notation](https://en.wikipedia.org/wiki/Einstein_notation)
  - [Index notation](https://en.wikipedia.org/wiki/Index_notation)
  - [Multi-index notation](https://en.wikipedia.org/wiki/Multi-index_notation)
  - [Penrose graphical notation](https://en.wikipedia.org/wiki/Penrose_graphical_notation)
  - [Ricci calculus](https://en.wikipedia.org/wiki/Ricci_calculus)
  - [Tetrad (index notation)](https://en.wikipedia.org/wiki/Tetrad_%28index_notation%29)
  - [Van der Waerden notation](https://en.wikipedia.org/wiki/Van_der_Waerden_notation)
  - [Voigt notation](https://en.wikipedia.org/wiki/Voigt_notation)
- Tensor definitions
  - [Tensor (intrinsic definition)](https://en.wikipedia.org/wiki/Tensor_%28intrinsic_definition%29)
  - [Tensor field](https://en.wikipedia.org/wiki/Tensor_field)
  - [Tensor density](https://en.wikipedia.org/wiki/Tensor_density)
  - [Tensors in curvilinear coordinates](https://en.wikipedia.org/wiki/Tensors_in_curvilinear_coordinates)
  - [Mixed tensor](https://en.wikipedia.org/wiki/Mixed_tensor)
  - [Antisymmetric tensor](https://en.wikipedia.org/wiki/Antisymmetric_tensor)
  - [Symmetric tensor](https://en.wikipedia.org/wiki/Symmetric_tensor)
  - [Tensor operator](https://en.wikipedia.org/wiki/Tensor_operator)
  - [Tensor bundle](https://en.wikipedia.org/wiki/Tensor_bundle)
  - [Two-point tensor](https://en.wikipedia.org/wiki/Two-point_tensor)
- [Operations](https://en.wikipedia.org/wiki/Operation_%28mathematics%29 "Operation (mathematics)")
  - [Covariant derivative](https://en.wikipedia.org/wiki/Covariant_derivative)
  - [Exterior covariant derivative](https://en.wikipedia.org/wiki/Exterior_covariant_derivative)
  - [Exterior derivative](https://en.wikipedia.org/wiki/Exterior_derivative)
  - [Exterior product](https://en.wikipedia.org/wiki/Exterior_product)
  - [Hodge star operator](https://en.wikipedia.org/wiki/Hodge_star_operator)
  - [Lie derivative](https://en.wikipedia.org/wiki/Lie_derivative)
  - [Raising and lowering indices](https://en.wikipedia.org/wiki/Raising_and_lowering_indices)
  - [Symmetrization](https://en.wikipedia.org/wiki/Symmetrization)
  - [Tensor contraction](https://en.wikipedia.org/wiki/Tensor_contraction)
  - [Tensor product](https://en.wikipedia.org/wiki/Tensor_product)
  - [Transpose](https://en.wikipedia.org/wiki/Transpose) (2nd-order tensors)
- Related abstractions
  - [Affine connection](https://en.wikipedia.org/wiki/Affine_connection)
  - [Basis](https://en.wikipedia.org/wiki/Basis_%28linear_algebra%29 "Basis (linear algebra)")
  - [Cartan formalism (physics)](https://en.wikipedia.org/wiki/Cartan_formalism_%28physics%29)
  - [Connection form](https://en.wikipedia.org/wiki/Connection_form)
  - [Covariance and contravariance of vectors](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors)
  - [Differential form](https://en.wikipedia.org/wiki/Differential_form)
  - [Dimension](https://en.wikipedia.org/wiki/Dimension)
  - [Exterior form](https://en.wikipedia.org/wiki/Exterior_form)
  - [Fiber bundle](https://en.wikipedia.org/wiki/Fiber_bundle)
  - [Geodesic](https://en.wikipedia.org/wiki/Geodesic)
  - [Levi-Civita connection](https://en.wikipedia.org/wiki/Levi-Civita_connection)
  - [Linear map](https://en.wikipedia.org/wiki/Linear_map)
  - [Manifold](https://en.wikipedia.org/wiki/Manifold)
  - [Matrix](https://en.wikipedia.org/wiki/Matrix_%28mathematics%29 "Matrix (mathematics)")
  - [Multivector](https://en.wikipedia.org/wiki/Multivector)
  - [Pseudotensor](https://en.wikipedia.org/wiki/Pseudotensor)
  - [Spinor](https://en.wikipedia.org/wiki/Spinor)
  - [Vector](https://en.wikipedia.org/wiki/Vector_%28mathematics_and_physics%29 "Vector (mathematics and physics)")
  - [Vector space](https://en.wikipedia.org/wiki/Vector_space)
- Notable tensors
  - Mathematics
    - [Kronecker delta](https://en.wikipedia.org/wiki/Kronecker_delta)
    - [Levi-Civita symbol](https://en.wikipedia.org/wiki/Levi-Civita_symbol)
    - [Metric tensor](https://en.wikipedia.org/wiki/Metric_tensor)
    - [Nonmetricity tensor](https://en.wikipedia.org/wiki/Nonmetricity_tensor)
    - [Ricci curvature](https://en.wikipedia.org/wiki/Ricci_curvature)
    - [Riemann curvature tensor](https://en.wikipedia.org/wiki/Riemann_curvature_tensor)
    - [Torsion tensor](https://en.wikipedia.org/wiki/Torsion_tensor)
    - [Weyl tensor](https://en.wikipedia.org/wiki/Weyl_tensor)
  - Physics
    - [Moment of inertia](https://en.wikipedia.org/wiki/Moment_of_inertia#Inertia_tensor)
    - [Angular momentum tensor](https://en.wikipedia.org/wiki/Angular_momentum#Angular_momentum_in_relativistic_mechanics "Angular momentum")
    - [Spin tensor](https://en.wikipedia.org/wiki/Spin_tensor)
    - [Cauchy stress tensor](https://en.wikipedia.org/wiki/Cauchy_stress_tensor)
    - [stress–energy tensor](https://en.wikipedia.org/wiki/Stress–energy_tensor "Stress–energy tensor")
    - [Einstein tensor](https://en.wikipedia.org/wiki/Einstein_tensor)
    - [EM tensor](https://en.wikipedia.org/wiki/Electromagnetic_tensor "Electromagnetic tensor")
    - [Gluon field strength tensor](https://en.wikipedia.org/wiki/Gluon_field_strength_tensor)
    - [Metric tensor (GR)](https://en.wikipedia.org/wiki/Metric_tensor_%28general_relativity%29 "Metric tensor (general relativity)")
- [Mathematicians](https://en.wikipedia.org/wiki/Mathematician "Mathematician")
  - [Élie Cartan](https://en.wikipedia.org/wiki/Élie_Cartan)
  - [Augustin-Louis Cauchy](https://en.wikipedia.org/wiki/Augustin-Louis_Cauchy)
  - [Elwin Bruno Christoffel](https://en.wikipedia.org/wiki/Elwin_Bruno_Christoffel)
  - [Albert Einstein](https://en.wikipedia.org/wiki/Albert_Einstein)
  - [Leonhard Euler](https://en.wikipedia.org/wiki/Leonhard_Euler)
  - [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss)
  - [Hermann Grassmann](https://en.wikipedia.org/wiki/Hermann_Grassmann)
  - [Tullio Levi-Civita](https://en.wikipedia.org/wiki/Tullio_Levi-Civita)
  - [Gregorio Ricci-Curbastro](https://en.wikipedia.org/wiki/Gregorio_Ricci-Curbastro)
  - [Bernhard Riemann](https://en.wikipedia.org/wiki/Bernhard_Riemann)
  - [Jan Arnoldus Schouten](https://en.wikipedia.org/wiki/Jan_Arnoldus_Schouten)
  - [Woldemar Voigt](https://en.wikipedia.org/wiki/Woldemar_Voigt)
  - [Hermann Weyl](https://en.wikipedia.org/wiki/Hermann_Weyl)

:::

<!-- XLET-END -->

