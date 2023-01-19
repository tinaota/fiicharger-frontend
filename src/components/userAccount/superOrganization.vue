<template>
    <div>
        <div class="superOrganization">
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('menu.organization')" name="organization"></el-tab-pane>
            </el-tabs>
            <Organizations v-if="active === 'organization'"></Organizations>
        </div>
    </div>
</template>

<script>
import Organizations from "@/components/userAccount/organizations";

export default {
    components: {
        Organizations
    },
    data() {
        return {
            active: "organization"
        };
    },
    mounted() {},
    methods: { handleTabClick(tab, event) {} }
};
</script>
<style lang = "scss" scoped>
.superOrganization {
    width: 100%;
    height: 100%;
}
</style>
