

<template>

<v-card color="grey lighten-4" flat>
    <v-card-text>
        <v-container fluid>
            <v-layout row>
                <v-flex xs4>
                    <v-subheader>ID</v-subheader>
                </v-flex>
                <v-flex xs8>
                    <v-text-field name="id" v-model="id">
                    </v-text-field>
                </v-flex>
            </v-layout>
            <v-layout row>
                <v-flex xs4>
                    <v-subheader>Server Name</v-subheader>
                </v-flex>
                <v-flex xs8>
                    <v-text-field autofocus name="server" v-model="server">
                    </v-text-field>
                </v-flex>
            </v-layout>
        </v-container>
        <v-btn @click="submit">Submit</v-btn>
        <!-- :disabled="!valid" -->
    </v-card-text>
</v-card>

</template>

<script>

var data = {
id: "5542",
    server: "serverName"
};

export default {
    name: "servers",
    data() {
        return data;
    },
    mounted: function() {
        this.$primus.on('data', function received(message) {
            console.log("received", message.data)
            data.server += message.data;
        })
    },
    beforeDestroy: function() {
        this.$primus.removeListener('data')
    },
    methods: {
        submit: function() {
            //      alert("Submit clicked");
            console.log("Wrote hello")
            this.$primus.write('Hello2 ')
        }
    }
};

</script>
