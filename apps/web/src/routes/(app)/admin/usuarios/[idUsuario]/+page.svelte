<script lang="ts">
	import { page } from '$app/stores';
	import UsuarioDetail from '$lib/usuarios/presentation/UsuarioDetail.svelte';

	let idUsuario = $derived($page.params.idUsuario ?? '');
</script>

<svelte:head>
	<title>Usuario {idUsuario} | ALVAS</title>
</svelte:head>

<UsuarioDetail {idUsuario} />
