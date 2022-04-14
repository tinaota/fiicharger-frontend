<template>
    <div class="noAccess">You do not have access to view other tabs. Please contact admin for access.</div>
</template>
<script>
export default {
    name: "Contact",
};
</script>

<style scoped>
.noAccess {
    display: flex;
    justify-content: center;
    color: red;
    margin-top: 15px;
    font-size: 1.5rem;
}
</style>