import React from 'react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Map from './Map'
import StandardsPanel from './StandardsPanel'

const Resizable = () => {
    return (
        <ResizablePanelGroup
            orientation="vertical"
            className="w-full h-full rounded-none border-none"
        >
            <ResizablePanel defaultSize="60%">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize="20%">
                        <div className="flex h-full w-full items-center justify-center p-6">
                            <span className="font-semibold">Data</span>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="60%" className="relative">
                        {/* Use a wrapper div to get size */}
                        <div className="w-full h-full" style={{position: 'relative', width: '100%', height: '100%'}}>
                            <Map />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="20%">
                        <div className="flex h-full w-full items-center justify-center p-6">
                            <span className="font-semibold">Fixes and Processes</span>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="40%">
                <div className="h-full w-full p-2">
                    <StandardsPanel />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export default Resizable
