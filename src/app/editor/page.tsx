"use client"
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Editor, { useMonaco } from '@monaco-editor/react';

export default function EditorPage() {
    const monaco = useMonaco()
    // const mySpecialLanguage = {
    //     defaultToken: '',
    //     tokenizer: {
    //       root: [
    //         [/[a-z_$][\w$]*/, { token: 'identifier' }],
    //         [/[{}()\[\]]/, '@brackets'],
    //         /[<>/, '@brackets'],
    //         [/(@symbols)(\s*)([a-zA-Z_]\w*)/, ['keyword', '', 'identifier']],
    //         [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
    //         [/0[xX][0-9a-fA-F']*/, 'number.hex'],
    //         [/0[0-7]*/, 'number.octal'],
    //         [/0[bB][01]*/, 'number.binary'],
    //         [/\d+/, 'number'],
    //       ],
    //     },
    //   };

    // monaco?.languages.register({ id: 'mySpecialLanguage' })

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" gutterBottom>
          Operaciones I/O Page
        </Typography>

        <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment"  theme="vs-dark"/>
      </Box>
    </Container>
  );
}
