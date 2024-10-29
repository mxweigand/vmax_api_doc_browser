# VMAX API Documentation Browser

This repository contains a web-based tool to automate and support the creation of implemenations of the VMAX interface for specific APIs. 
The tool enables users to explore the Javadoc API documetation and create and the interface by selecting relevant components of the API form the Javadoc.

# The VMAX interface

## General idea

The idea of the VMAX interface is to provide a reausable interface for software featuring an API, that allows RDF-based access to the information available from the API.

Two options to access the interface are available:

- A triple pattern based interface.
The central idea of the VMAX interface is to abstract object oriented data from APIs as triples of an RDF knowledge graph.
Within the VMAX core library, the mapping from object oriented data to RDF triples is defined. 
The information available from the API can therefore be abstracted as a set of triples, i.e. a knowledge graph.
To query this graph, a logic to execute triple pattern queries is defined by the VMAX core library.

- The second option is to query the information using SPARQL.
This is realized by using the Apache Jena framework, specifically its query processor ARQ.
The query processor can execute SPARQL queries and uses the triple pattern interface to access the abstracted data of the API. 

## Implementation

The general idea explained above was developed during my research on interoperability in engineering using Semantic Web technologies. 
Please refer to the section [References](#references) if you are interested in the scientific background of this.

Within this and other repositories (see [Links](#links)), implementations of the approaches of my research are provided.
The implementations are no production-ready libraries and are only meant to demonstrate and evaluate my research. 
This also means, that while the scientific approach describes a general interface for APIs of object oriented software, the VMAX interface was only implemented for Java-based APIs.
This repository therefore contains a tool to analyze the Javadoc of a Java API and create an implementation of the VMAX interface for this API.
To demonstrate the VMAX interface, it was implemented for a specific software, Magic Systems Of Systems Architect, see [Links](#links).
The tool provided in this repository was therefore also tested for the Javadoc of the API of Magic Systems Of Systems Architect.
It possible to use the tool for other Javadocs of other APIs, as Javadocs are created in a standardized way.
However, minor adjustments may be necessary for to the tool to support other Javadocs.

# How to use

Step **(1)** - 
Get Node.js and npm installed on your machine.
Please refer to the [Node.js website](https://nodejs.org/en/download/) for instructions.

Step **(2)** -
Get NestJS by running `npm install -g @nestjs/cli` in your terminal.

Step **(3)** - 
Download the source code of this repository.

Step **(4)** - 
Copy the file [`java-doc-path.example.ts`](./src/jdoc-express/java-doc-path.example.ts) and rename it to `java-doc-path.ts`.
In the new file, chagne the constant `javaDocPath` to indicate the root path of the Javadoc of the API you want to create the VMAX interface for.
Please follow the path format provided in the example file [`java-doc-path.example.ts`](./src/jdoc-express/java-doc-path.example.ts).

Step **(5)** - 
Install dependencies by running `npm install` in the root directory of the repository.

Step **(6)** -
Build and run the application by executing `npm run start:dev` in the root directory of the repository.

# Links

- [VMAX Core](https://github.com/mxweigand/vmax_core) 
The core library of the VMAX interface.

- [VMAX Plugin for MSOSA](https://github.com/mxweigand/vmax_plugin_msosa) 
An implementation of the VMAX interface for Magic Systems Of Systems Architect.

# References

The following publications provide further insights into my research:

- Weigand, M. and Fay, A. (2022). *Creating Virtual Knowledge Graphs from Software-Internal Data.* IECON 2022 – 48th Annual Conference of the IEEE Industrial Electronics Society. [DOI: 10.1109/IECON49645.2022.9969051](https://doi.org/10.1109/IECON49645.2022.9969051).

- Weigand, M. (2023). *Triple Pattern Interfaces for Object-Oriented Software APIs.* Doctoral Consortium at ISWC 2023 co-located with 22nd International Semantic Web Conference (ISWC 2023). [Link](https://ceur-ws.org/Vol-3678/paper8.pdf).

- Weigand, M.; Gehlhoff, F. and Fay, A. (2024). *Extracting API Structures from Documentation to Create Virtual Knowledge Graphs.* 16th International Joint Conference on Knowledge Discovery, Knowledge Engineering and Knowledge Management - Volume 2: KEOD. 

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.